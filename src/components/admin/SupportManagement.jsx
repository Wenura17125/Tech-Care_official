import React, { useState } from 'react';
import {
    MessageSquare, User, Clock, AlertCircle, CheckCircle,
    Search, Filter, Send, MoreVertical, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const SupportManagement = () => {
    const [tickets, setTickets] = useState([
        { id: 'TIC-101', user: 'Anil Perera', email: 'anil@example.com', issue: 'Payment failed for Order #932', priority: 'high', status: 'open', lastUpdate: '2h ago' },
        { id: 'TIC-102', user: 'Sarah Jansz', email: 'sarah@example.com', issue: 'Cannot update profile picture', priority: 'low', status: 'open', lastUpdate: '5h ago' },
        { id: 'TIC-103', user: 'Gamini Silva', email: 'gamini@tech.com', issue: 'Technician did not arrive on time', priority: 'medium', status: 'resolved', lastUpdate: '1d ago' },
        { id: 'TIC-104', user: 'Admin System', email: 'system@techcare.com', issue: 'Database backup alert', priority: 'high', status: 'open', lastUpdate: '10m ago' },
    ]);

    const [selectedTicket, setSelectedTicket] = useState(tickets[0]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-['Outfit'] font-bold text-white">Support & Help Desk</h2>
                    <p className="text-zinc-400">Manage user inquiries and platform support tickets</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-red-500/50 text-red-500 px-3">
                        <ShieldAlert className="h-3 w-3 mr-2" />
                        2 Urgent Tickets
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Ticket List */}
                <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 flex flex-col">
                    <CardHeader className="border-b border-zinc-800">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input placeholder="Search tickets..." className="pl-8 bg-zinc-800 border-zinc-700 text-white h-9" />
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/50 border border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-zinc-500">{ticket.id}</span>
                                        <Badge className={`${ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                ticket.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            } border-0 text-[10px] h-4 uppercase`}>
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-semibold text-white truncate">{ticket.issue}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-zinc-500">{ticket.user}</span>
                                        <span className="text-[10px] text-zinc-600">{ticket.lastUpdate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Ticket Detail & Chat */}
                <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col">
                    {selectedTicket ? (
                        <>
                            <CardHeader className="border-b border-zinc-800 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://api.dicebear.com/9.x/micah/svg?seed=${selectedTicket.user}&backgroundColor=18181b`} />
                                            <AvatarFallback>{selectedTicket.user[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg text-white">{selectedTicket.user}</CardTitle>
                                            <CardDescription className="text-zinc-500">{selectedTicket.email}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400">Resolve</Button>
                                        <Button variant="outline" size="icon" className="border-zinc-800">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-800 max-w-[80%]">
                                    <p className="text-sm text-zinc-300">
                                        Hi TechCare support, I tried to pay for my iPhone repair using my Visa card but it keeps saying
                                        "Transaction Declined". My card is working fine for other sites. Can you help?
                                    </p>
                                    <span className="text-[10px] text-zinc-500 mt-2 block">10:45 AM</span>
                                </div>

                                <div className="flex justify-end">
                                    <div className="bg-emerald-600/20 p-4 rounded-2xl border border-emerald-500/30 max-w-[80%] text-right">
                                        <p className="text-sm text-emerald-100">
                                            Hello Anil! I'm sorry to hear that. I checked our payment gateway logs and it seems there was
                                            a temporary handshake issue with your bank. Could you please try again in 5 minutes?
                                        </p>
                                        <span className="text-[10px] text-emerald-500/70 mt-2 block">11:02 AM</span>
                                    </div>
                                </div>
                            </div>
                            <CardFooter className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                                <div className="flex w-full gap-2">
                                    <Textarea placeholder="Type your response..." className="flex-1 bg-zinc-800 border-zinc-700 min-h-[40px] max-h-[120px]" />
                                    <Button className="bg-white text-black hover:bg-gray-200 self-end">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-center items-center justify-center text-zinc-500">
                            Select a ticket to view details
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SupportManagement;
