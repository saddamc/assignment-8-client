"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import { clientFetch } from "@/lib/client-fetch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Order {
    id: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    customer?: {
        name: string;
        email: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
        };
    }>;
}

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    PACKED: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    ON_THE_WAY: "bg-cyan-100 text-cyan-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
    UNPAID: "bg-red-100 text-red-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [paymentFilter, setPaymentFilter] = useState<string>("");

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter]);

    const fetchOrders = async () => {
        try {
            const filters: any = {};
            if (statusFilter) filters.status = statusFilter;
            if (paymentFilter) filters.paymentStatus = paymentFilter;

            const res = await clientFetch("/orders", {
                method: "GET",
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await clientFetch(`/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Order status updated");
                fetchOrders();
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all orders on the platform.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="PACKED">Packed</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="ON_THE_WAY">On The Way</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by payment" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Payments</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-sm">{order.id.slice(-8)}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.customer?.name || order.customerEmail}</div>
                                            <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[order.status as keyof typeof statusColors] || "bg-gray-100"}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors] || "bg-gray-100"}>
                                            {order.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Order Details - {order.id.slice(-8)}</DialogTitle>
                                                    </DialogHeader>
                                                    {selectedOrder && (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold">Customer</h4>
                                                                    <p>{selectedOrder.customer?.name || selectedOrder.customerEmail}</p>
                                                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold">Order Info</h4>
                                                                    <p>Total: ${selectedOrder.totalAmount.toFixed(2)}</p>
                                                                    <p>Payment: {selectedOrder.paymentMethod}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="font-semibold mb-2">Items</h4>
                                                                <div className="space-y-2">
                                                                    {selectedOrder.items.map((item) => (
                                                                        <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                                                                            <div>
                                                                                <p className="font-medium">{item.product.name}</p>
                                                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                                            </div>
                                                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <Select onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}>
                                                                    <SelectTrigger className="w-48">
                                                                        <SelectValue placeholder="Update Status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="PROCESSING">Processing</SelectItem>
                                                                        <SelectItem value="PACKED">Packed</SelectItem>
                                                                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                                                                        <SelectItem value="ON_THE_WAY">On The Way</SelectItem>
                                                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}