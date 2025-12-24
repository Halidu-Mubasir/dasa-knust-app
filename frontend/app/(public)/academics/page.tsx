'use client';

import { useState, useEffect, useMemo } from 'react';
import { AcademicResource } from '@/types';
import api from '@/lib/axios';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

const COLLEGES = [
    { value: 'CoS', label: 'College of Science' },
    { value: 'CoE', label: 'College of Engineering' },
    { value: 'CoHS', label: 'College of Health Sciences' },
    { value: 'CABE', label: 'College of Art and Built Environment' },
    { value: 'CoHSS', label: 'College of Humanities and Social Sciences' },
    { value: 'CANR', label: 'College of Agriculture and Natural Resources' },
];

const LEVELS = [100, 200, 300, 400, 500, 600];
const SEMESTERS = [1, 2];

function AcademicsContent() {
    const [resources, setResources] = useState<AcademicResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');

    useEffect(() => {
        fetchResources();
    }, [selectedCollege, selectedLevel, selectedSemester]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};

            if (selectedCollege) params.college = selectedCollege;
            if (selectedLevel) params.level = selectedLevel;
            if (selectedSemester) params.semester = selectedSemester;

            const { data } = await api.get<AcademicResource[]>('/resources/', { params });
            setResources(data);
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = useMemo(() => {
        if (!searchQuery) return resources;

        const query = searchQuery.toLowerCase();
        return resources.filter(
            (resource) =>
                resource.title.toLowerCase().includes(query) ||
                resource.course_code.toLowerCase().includes(query)
        );
    }, [resources, searchQuery]);

    const handleClearFilters = () => {
        setSelectedCollege('');
        setSelectedLevel('');
        setSelectedSemester('');
        setSearchQuery('');
    };

    const handleResourceDownload = (updatedResource: AcademicResource) => {
        // Update the resource in the list with new download count
        setResources((prev) =>
            prev.map((r) => (r.id === updatedResource.id ? updatedResource : r))
        );
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            {/* Header */}
            <PageHeader
                title="Pasco Bank"
                description="Access past questions, slides, and study materials for all levels and colleges"
            />

            {/* Filters */}
            <Card className="p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or course code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* College Filter */}
                    <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Colleges" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Colleges</SelectItem>
                            {COLLEGES.map((college) => (
                                <SelectItem key={college.value} value={college.value}>
                                    {college.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Level Filter */}
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {LEVELS.map((level) => (
                                <SelectItem key={level} value={level.toString()}>
                                    Level {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Semester Filter */}
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {SEMESTERS.map((semester) => (
                                <SelectItem key={semester} value={semester.toString()}>
                                    Semester {semester}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Clear Filters */}
                    <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="lg:col-span-2"
                    >
                        Clear Filters
                    </Button>
                </div>
            </Card>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                    {loading ? 'Loading...' : `${filteredResources.length} resource(s) found`}
                </p>
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading resources...</p>
                </div>
            ) : filteredResources.length === 0 ? (
                <Card className="p-12 text-center">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery || selectedCollege || selectedLevel || selectedSemester
                            ? 'Try adjusting your filters or search query'
                            : 'No resources available yet. Check back later!'}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onDownload={handleResourceDownload}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AcademicsPage() {
    return (
        <AuthGuard>
            <AcademicsContent />
        </AuthGuard>
    );
}
