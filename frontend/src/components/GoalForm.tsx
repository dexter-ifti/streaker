import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CATEGORIES, getCategoryBgClass, CategoryName } from './ActivityForm';
import { Goal, CreateGoalData, UpdateGoalData } from '../utils/api';

interface GoalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateGoalData | UpdateGoalData) => void;
    editingGoal?: Goal | null;
    isLoading?: boolean;
}

const GoalForm: React.FC<GoalFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingGoal,
    isLoading = false
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
    const [targetCount, setTargetCount] = useState(1);
    const [targetDays, setTargetDays] = useState<number | undefined>(30);
    const [category, setCategory] = useState<CategoryName>('General');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);

    useEffect(() => {
        if (editingGoal) {
            setName(editingGoal.name);
            setDescription(editingGoal.description || '');
            setPeriod(editingGoal.period);
            setTargetCount(editingGoal.targetCount);
            setTargetDays(editingGoal.targetDays);
            setCategory((editingGoal.category as CategoryName) || 'General');
            setStartDate(editingGoal.startDate.split('T')[0]);
        } else {
            resetForm();
        }
    }, [editingGoal, isOpen]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setPeriod('DAILY');
        setTargetCount(1);
        setTargetDays(30);
        setCategory('General');
        setStartDate(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        const data: CreateGoalData = {
            name: name.trim(),
            description: description.trim() || undefined,
            period,
            targetCount,
            targetDays,
            category,
            startDate: new Date(startDate).toISOString(),
        };

        onSubmit(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Goal Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Exercise Daily"
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your goal..."
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Period *
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between"
                                >
                                    <span>{period}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isPeriodOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isPeriodOpen && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
                                        {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => {
                                                    setPeriod(p);
                                                    setIsPeriodOpen(false);
                                                }}
                                                className={`w-full px-3 py-2 text-left text-white hover:bg-gray-600 ${period === p ? 'bg-gray-600' : ''}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Target Count *
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={targetCount}
                                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Duration (days)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={targetDays || ''}
                                onChange={(e) => setTargetDays(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="30"
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Category
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className={`w-full px-3 py-2 rounded-lg border flex items-center justify-between ${getCategoryBgClass(category)}`}
                            >
                                <span>{category}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCategoryOpen && (
                                <div className="absolute top-full mt-1 left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden max-h-48 overflow-y-auto">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => {
                                                setCategory(cat.name);
                                                setIsCategoryOpen(false);
                                            }}
                                            className={`w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-600 ${category === cat.name ? 'bg-gray-600' : ''}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalForm;
