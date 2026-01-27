import React, { useState } from 'react';
import {
    MapPin, Globe, Plus, Trash2, Edit, CheckCircle,
    XCircle, Filter, Search, Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ServiceAreasManagement = () => {
    const [areas, setAreas] = useState([
        { id: 1, city: 'Colombo', region: 'Western', status: 'active', technicians: 45, coverage: 'High' },
        { id: 2, city: 'Kandy', region: 'Central', status: 'active', technicians: 12, coverage: 'Medium' },
        { id: 3, city: 'Galle', region: 'Southern', status: 'active', technicians: 8, coverage: 'Low' },
        { id: 4, city: 'Jaffna', region: 'Northern', status: 'inactive', technicians: 0, coverage: 'None' },
        { id: 5, city: 'Negombo', region: 'Western', status: 'active', technicians: 22, coverage: 'High' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-['Outfit'] font-bold text-white">Service Areas</h2>
                    <p className="text-zinc-400">Manage platform coverage and regional technicians</p>
                </div>
                <Button className="bg-white text-black hover:bg-gray-100 font-semibold rounded-full px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Area
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">24 Cities</div>
                        <p className="text-xs text-zinc-500 mt-1">across 9 provinces</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400">Active Technicians</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">87 Total</div>
                        <p className="text-xs text-emerald-500 mt-1">+5 new this week</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400">Growth Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">18.5%</div>
                        <p className="text-xs text-zinc-500 mt-1">monthly expansion rate</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-zinc-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-white font-['Outfit']">Regional Distribution</CardTitle>
                        <div className="flex bg-zinc-800 p-1 rounded-lg border border-zinc-700">
                            <Input placeholder="Search cities..." className="h-8 w-48 bg-transparent border-0 text-white placeholder:text-zinc-500" />
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-400">City / District</TableHead>
                            <TableHead className="text-zinc-400">Region</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Technicians</TableHead>
                            <TableHead className="text-zinc-400">Density</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {areas.map((area) => (
                            <TableRow key={area.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                <TableCell className="font-medium text-white flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-500" />
                                    {area.city}
                                </TableCell>
                                <TableCell className="text-zinc-400">{area.region}</TableCell>
                                <TableCell>
                                    <Badge variant={area.status === 'active' ? 'default' : 'secondary'}
                                        className={area.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : ''}>
                                        {area.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-300 font-['Outfit']">{area.technicians}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`$ {
                      area.coverage === 'High' ? 'text-emerald-400 border-emerald-500/50' :
                      area.coverage === 'Medium' ? 'text-blue-400 border-blue-500/50' :
                      'text-zinc-500 border-zinc-800'
                   }`}>
                                        {area.coverage}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default ServiceAreasManagement;
