
-- Create profiles table first (referenced by other tables)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  paid_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text DEFAULT 'general',
  receipt_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create expense_splits table
CREATE TABLE public.expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(expense_id, user_id)
);

-- Create settlements table
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  settled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CHECK (from_user != to_user)
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for groups table
CREATE POLICY "Users can view groups they are members of" ON public.groups FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = groups.id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Group creators can delete their groups" ON public.groups FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for group_members table
CREATE POLICY "Users can view group members for their groups" ON public.group_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
  )
);
CREATE POLICY "Group admins can manage members" ON public.group_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
  )
);
CREATE POLICY "Users can insert themselves into groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for expenses table
CREATE POLICY "Users can view expenses for their groups" ON public.expenses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = expenses.group_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Group members can create expenses" ON public.expenses FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = expenses.group_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Expense payers can update their expenses" ON public.expenses FOR UPDATE USING (auth.uid() = paid_by);
CREATE POLICY "Expense payers can delete their expenses" ON public.expenses FOR DELETE USING (auth.uid() = paid_by);

-- RLS Policies for expense_splits table
CREATE POLICY "Users can view splits for their expenses" ON public.expense_splits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.expenses e
    JOIN public.group_members gm ON e.group_id = gm.group_id
    WHERE e.id = expense_splits.expense_id AND gm.user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage their own splits" ON public.expense_splits FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for settlements table
CREATE POLICY "Users can view settlements they are involved in" ON public.settlements FOR SELECT USING (
  auth.uid() = from_user OR auth.uid() = to_user OR
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = settlements.group_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create settlements for themselves" ON public.settlements FOR INSERT WITH CHECK (
  auth.uid() = from_user OR auth.uid() = to_user
);
CREATE POLICY "Users can update settlements they are involved in" ON public.settlements FOR UPDATE USING (
  auth.uid() = from_user OR auth.uid() = to_user
);

-- RLS Policies for user_preferences table
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to calculate user balances
CREATE OR REPLACE FUNCTION public.calculate_user_balance(user_uuid uuid, group_uuid uuid DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_paid numeric := 0;
  total_owed numeric := 0;
  balance numeric := 0;
BEGIN
  -- Calculate total amount paid by user
  SELECT COALESCE(SUM(e.amount), 0) INTO total_paid
  FROM public.expenses e
  WHERE e.paid_by = user_uuid
  AND (group_uuid IS NULL OR e.group_id = group_uuid);
  
  -- Calculate total amount owed by user
  SELECT COALESCE(SUM(es.amount), 0) INTO total_owed
  FROM public.expense_splits es
  JOIN public.expenses e ON es.expense_id = e.id
  WHERE es.user_id = user_uuid
  AND (group_uuid IS NULL OR e.group_id = group_uuid);
  
  balance := total_paid - total_owed;
  
  RETURN balance;
END;
$$;
