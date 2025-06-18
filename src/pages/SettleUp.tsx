import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const SettleUp = () => {
  const [formData, setFormData] = useState({
    payer: "You",
    receiver: "",
    amount: "",
    method: "cash",
    notes: ""
  });

  const members = ["Sarah", "Mike", "Emma", "Tom"];
  const paymentMethods = ["Cash", "Venmo", "PayPal", "Bank Transfer", "Zelle"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Settle up:", formData);
    // TODO: Implement actual settlement logic
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/groups" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <DollarSign className="w-6 h-6 mr-3" />
                Settle Up
              </h1>
              <p className="text-muted-foreground">Record a payment between group members</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const balances = calculateBalances();
  const hasBalances = Object.values(balances).some(balance => balance !== 0);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-paypal-highlight hover:text-paypal-highlight/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From (Payer)</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={formData.payer === "You" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, payer: "You" }))}
                      >
                        You
                      </Button>
                      {members.map((member) => (
                        <Button
                          key={member}
                          type="button"
                          variant={formData.payer === member ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, payer: member }))}
                        >
                          {member}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>To (Receiver)</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.payer !== "You" && (
                        <Button
                          type="button"
                          variant={formData.receiver === "You" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, receiver: "You" }))}
                        >
                          You
                        </Button>
                      )}
                      {members.filter(member => member !== formData.payer).map((member) => (
                        <Button
                          key={member}
                          type="button"
                          variant={formData.receiver === member ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, receiver: member }))}
                        >
                          {member}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method}
                        type="button"
                        variant={formData.method === method.toLowerCase() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, method: method.toLowerCase() }))}
                      >
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Payment reference, transaction ID, etc..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                {formData.payer && formData.receiver && formData.amount && (
                  <div className="bg-paypal-primary/10 border border-paypal-primary/20 p-4 rounded-lg">
                    <div className="font-medium text-center">
                      {formData.payer} pays {formData.receiver} ${formData.amount}
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-1">
                      via {formData.method.charAt(0).toUpperCase() + formData.method.slice(1)}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-paypal-highlight text-white hover:bg-paypal-highlight/90"
                  disabled={!formData.payer || !formData.receiver || !formData.amount}
                >
                  Record Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SettleUp;
