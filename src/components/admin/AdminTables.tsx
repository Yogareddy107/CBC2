'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch (e) {
        return 'N/A';
    }
};

const formatDateTime = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
        return new Date(dateStr).toLocaleString();
    } catch (e) {
        return 'N/A';
    }
};

export interface UserData {
    id: string;
    email: string;
    fullName: string;
    signupDate: string;
    totalAnalyses: number;
    lastActive: string;
    plan: string;
}

export interface AnalysisData {
    id: string;
    repoUrl: string;
    userEmail: string;
    createdAt: string;
    status: string;
}

export interface TeamData {
    id: string;
    name: string;
    inviteCode: string;
    ownerEmail: string;
    createdAt: string;
    plan: string;
}

export interface TopRepoData {
    repoUrl: string;
    count: number;
}

export interface AdminTablesProps {
    users: UserData[];
    analyses: AnalysisData[];
    teams: TeamData[];
    topRepos: TopRepoData[];
}

export function AdminTables({ users, analyses, teams, topRepos }: AdminTablesProps) {
    const [mounted, setMounted] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userSortField, setUserSortField] = useState<keyof UserData>('signupDate');
    const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        return users
            .filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()))
            .sort((a, b) => {
                const valA = a[userSortField];
                const valB = b[userSortField];

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return userSortOrder === 'asc'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return userSortOrder === 'asc' ? valA - valB : valB - valA;
                }

                return 0;
            });
    }, [users, userSearch, userSortField, userSortOrder]);

    const toggleUserSort = (field: keyof UserData) => {
        if (userSortField === field) {
            setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setUserSortField(field);
            setUserSortOrder('desc');
        }
    };

    if (!mounted) {
        return (
            <div className="space-y-12 py-10">
                <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
                <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* SECTION B — User Table */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold tracking-tight">Users</h2>
                    <div className="w-64">
                        <Input
                            placeholder="Search by email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>

                <div className="rounded-md border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                                <th
                                    className="px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                                    onClick={() => toggleUserSort('signupDate')}
                                >
                                    Signup Date {userSortField === 'signupDate' && (userSortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground text-center"
                                    onClick={() => toggleUserSort('totalAnalyses')}
                                >
                                    Total Analyses {userSortField === 'totalAnalyses' && (userSortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Last Active</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{user.email}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {formatDate(user.signupDate)}
                                    </td>
                                    <td className="px-4 py-3 text-center">{user.totalAnalyses}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {formatDate(user.lastActive)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="font-normal">{user.plan}</Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION C — Recent Analyses */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Recent Analyses</h2>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Repo URL</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">User Email</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Created At</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {analyses.length > 0 ? analyses.map((analysis) => (
                                <tr key={analysis.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 max-w-xs truncate font-mono text-xs">
                                        {analysis.repoUrl}
                                    </td>
                                    <td className="px-4 py-3">{analysis.userEmail}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {formatDateTime(analysis.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={analysis.status === 'completed' ? 'secondary' : analysis.status === 'failed' ? 'destructive' : 'outline'}
                                            className="capitalize"
                                        >
                                            {analysis.status}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No analyses found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION D — Teams */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Active Teams</h2>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Team Name</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Owner</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Invite Code</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                                <th className="px-4 py-3 font-medium text-muted-foreground">Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {teams && teams.length > 0 ? teams.map((team) => (
                                <tr key={team.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{team.name}</td>
                                    <td className="px-4 py-3">{team.ownerEmail}</td>
                                    <td className="px-4 py-3"><code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{team.inviteCode}</code></td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatDate(team.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="capitalize">{team.plan}</Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No teams found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION E — Top Repositories */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Top Analyzed Repositories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topRepos && topRepos.length > 0 ? topRepos.map((repo, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex justify-between items-center transition-all hover:border-[#FF7D29]/20">
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-xs font-bold text-[#FF7D29] uppercase tracking-widest">Rank #{idx + 1}</span>
                                <span className="text-sm font-mono truncate text-slate-900" title={repo.repoUrl}>{repo.repoUrl.split('/').pop()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-slate-900">{repo.count}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Analyses</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground">No analysis data available</p>
                    )}
                </div>
            </section>
        </div>
    );
}
