"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/useAuthStore";

type NewAddress = {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
};

export default function NewAddressPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<NewAddress>({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
    });

    useEffect(() => {
        if (!user || user.role !== "CUSTOMER") {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !address.fullName ||
            !address.phone ||
            !address.addressLine1 ||
            !address.city ||
            !address.state ||
            !address.postalCode
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await clientFetch("/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: "Home",
                    fullName: address.fullName,
                    phone: address.phone,
                    line1: address.addressLine1,
                    line2: address.addressLine2 || undefined,
                    city: address.city,
                    state: address.state,
                    postalCode: address.postalCode,
                    country: address.country,
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Address saved successfully!");
                router.push("/dashboard/addresses");
            } else {
                toast.error(data.message || "Failed to save address");
            }
        } catch (error) {
            toast.error("Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/addresses"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Addresses
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-serif font-bold mb-2">Add New Address</h1>
                <p className="text-zinc-600">Add a delivery address for faster checkout.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-semibold">Address Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={address.fullName}
                                onChange={(e) => setAddress(prev => ({ ...prev, fullName: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={address.phone}
                                onChange={(e) => setAddress(prev => ({ ...prev, phone: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="addressLine1">Street Address *</Label>
                        <Input
                            id="addressLine1"
                            placeholder="123 Main Street"
                            value={address.addressLine1}
                            onChange={(e) => setAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input
                            id="addressLine2"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            value={address.addressLine2}
                            onChange={(e) => setAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                placeholder="New York"
                                value={address.city}
                                onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                placeholder="NY"
                                value={address.state}
                                onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">ZIP Code *</Label>
                            <Input
                                id="postalCode"
                                placeholder="10001"
                                value={address.postalCode}
                                onChange={(e) => setAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                placeholder="United States"
                                value={address.country}
                                onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button type="submit" disabled={loading} className="px-8">
                            {loading ? "Saving..." : "Save Address"}
                        </Button>
                        <Link href="/dashboard/addresses">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}