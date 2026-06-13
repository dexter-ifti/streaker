import React, { useState } from 'react';
import { Plus, Layout, X } from 'lucide-react';
import { toast } from 'react-toastify';
import GoalList from './GoalList';
import GoalForm from './GoalForm';
import GoalTemplateCard from './GoalTemplateCard';
import BadgeDisplay from './BadgeDisplay';
import {
    useGoals,
    useGoalTemplates,
    useUserBadges,
    useAllBadges,
    useCreateGoal,
    useUpdateGoal,
    useDeleteGoal,
    useUpdateGoalProgress,
    useCreateGoalFromTemplate
} from '../hooks/useQueries';
import { useAuth } from '../utils/auth';
import { Goal, GoalTemplate, CreateGoalData, UpdateGoalData } from '../utils/api';

type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'FAILED';

const GoalsSection: React.FC = () => {
    const { authUser } = useAuth();
    const token = authUser?.token ?? '';

    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    // Queries
    const { data: goals = [], isLoading: goalsLoading } = useGoals(
        token,
        statusFilter === 'ALL' ? undefined : statusFilter
    );
    const { data: templates = [], isLoading: templatesLoading } = useGoalTemplates(token);
    const { data: userBadges = [], isLoading: userBadgesLoading } = useUserBadges(token);
    const { data: allBadges = [], isLoading: allBadgesLoading } = useAllBadges(token);

    // Mutations
    const createGoalMutation = useCreateGoal();
    const updateGoalMutation = useUpdateGoal();
    const deleteGoalMutation = useDeleteGoal();
    const updateProgressMutation = useUpdateGoalProgress();
    const createFromTemplateMutation = useCreateGoalFromTemplate();

    const handleCreateGoal = async (data: CreateGoalData | UpdateGoalData) => {
        try {
            if (editingGoal) {
                await updateGoalMutation.mutateAsync({
                    token,
                    goalId: editingGoal.id,
                    data: data as UpdateGoalData
                });
                toast.success('Goal updated successfully!');
            } else {
                await createGoalMutation.mutateAsync({
                    token,
                    data: data as CreateGoalData
                });
                toast.success('Goal created successfully!');
            }
            setIsFormOpen(false);
            setEditingGoal(null);
        } catch (error) {
            toast.error('Failed to save goal. Please try again.');
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            await deleteGoalMutation.mutateAsync({ token, goalId });
            toast.success('Goal deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete goal. Please try again.');
        }
    };

    const handleTogglePause = async (goalId: string, isPaused: boolean) => {
        try {
            await updateGoalMutation.mutateAsync({
                token,
                goalId,
                data: { status: isPaused ? 'ACTIVE' : 'PAUSED' }
            });
            toast.success(isPaused ? 'Goal resumed!' : 'Goal paused!');
        } catch (error) {
            toast.error('Failed to update goal. Please try again.');
        }
    };

    const handleIncrementProgress = async (goalId: string) => {
        try {
            await updateProgressMutation.mutateAsync({ token, goalId, incrementBy: 1 });
            toast.success('Progress updated!');
        } catch (error) {
            toast.error('Failed to update progress. Please try again.');
        }
    };

    const handleSelectTemplate = async (template: GoalTemplate) => {
        try {
            await createFromTemplateMutation.mutateAsync({
                token,
                templateId: template.id,
                startDate: new Date().toISOString()
            });
            toast.success(`Goal "${template.name}" created from template!`);
            setIsTemplatesOpen(false);
        } catch (error) {
            toast.error('Failed to create goal from template. Please try again.');
        }
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setIsFormOpen(true);
    };

    const statusTabs: { value: StatusFilter; label: string }[] = [
        { value: 'ALL', label: 'All' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'PAUSED', label: 'Paused' },
        { value: 'FAILED', label: 'Failed' },
    ];

    return (
        <section className="streaker-panel p-6 sm:p-8" aria-label="Goals and achievements">
            {/* Badges Section */}
            <div className="mb-8">
                <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-xl font-bold text-ink tracking-[-0.01em]">Achievements</h3>
                    <span className="text-sm text-ink-muted font-medium">
                        {userBadges.length} of {allBadges.length}
                    </span>
                </div>
                <BadgeDisplay
                    earnedBadges={userBadges}
                    allBadges={allBadges}
                    isLoading={userBadgesLoading || allBadgesLoading}
                />
            </div>

            {/* Goals Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-xl font-bold text-ink tracking-[-0.01em]">Goals</h3>
                    <p className="mt-1 text-sm text-ink-muted">What you're chaining toward.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsTemplatesOpen(true)}
                        className="streaker-btn-secondary"
                        type="button"
                    >
                        <Layout className="w-4 h-4" aria-hidden="true" />
                        <span>Templates</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingGoal(null);
                            setIsFormOpen(true);
                        }}
                        className="streaker-btn-primary"
                        type="button"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>New goal</span>
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setStatusFilter(tab.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-tight whitespace-nowrap transition-colors border-2 ${
                            statusFilter === tab.value
                                ? 'bg-brand-punch/15 text-brand-punch border-brand-orchid'
                                : 'bg-brand-lilac text-ink border-transparent hover:bg-brand-orchid'
                        }`}
                        type="button"
                        aria-pressed={statusFilter === tab.value}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Goals List */}
            <GoalList
                goals={goals}
                isLoading={goalsLoading}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onTogglePause={handleTogglePause}
                onIncrementProgress={handleIncrementProgress}
                emptyMessage={
                    statusFilter === 'ALL'
                        ? 'No goals yet. Create your first goal!'
                        : `No ${statusFilter.toLowerCase()} goals.`
                }
            />

            {/* Goal Form Modal */}
            <GoalForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingGoal(null);
                }}
                onSubmit={handleCreateGoal}
                editingGoal={editingGoal}
                isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
            />

            {/* Templates Modal */}
            {isTemplatesOpen && (
                <div className="fixed inset-0 bg-ink/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl border border-brand-orchid w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-brand-orchid">
                            <div className="flex items-center gap-2">
                                <Layout className="w-5 h-5 text-brand-punch" />
                                <h2 className="text-lg font-semibold text-ink">Goal Templates</h2>
                            </div>
                            <button
                                onClick={() => setIsTemplatesOpen(false)}
                                className="p-1 rounded-lg hover:bg-brand-lilac transition-colors"
                            >
                                <X className="w-5 h-5 text-ink-muted" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {templatesLoading ? (
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-24 bg-brand-lilac rounded-xl animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : templates.length === 0 ? (
                                <p className="text-center text-ink-muted py-8">
                                    No templates available.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {templates.map((template) => (
                                        <GoalTemplateCard
                                            key={template.id}
                                            template={template}
                                            onSelect={handleSelectTemplate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GoalsSection;
