import { Plus, Calendar } from 'lucide-react';
import { ActivityForm, ActivityList } from '.';

interface ActivitySectionProps {
  activities: any[];
  currentPage: number;
  totalPages: number;
  onSubmit: (description: string) => Promise<void>;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const ActivitySection = ({
  activities,
  currentPage,
  totalPages,
  onSubmit,
  onPreviousPage,
  onNextPage
}: ActivitySectionProps) => (
  <div className="bg-gray-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
    <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-3 text-white">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
        <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      Today's Activities
    </h2>

    <div className="mb-8">
      <ActivityForm onSubmit={onSubmit} />
    </div>

    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Recent Activities</h3>
      </div>
      <ActivityList activities={activities} />
    </div>

    {totalPages > 1 && (
      <div className="flex items-center justify-between mt-8 gap-4">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 border border-gray-600/50"
        >
          Previous
        </button>
        <span className="text-lg text-gray-300 bg-gray-700/30 px-4 py-2 rounded-xl">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 border border-gray-600/50"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

// ****************************************************************************************************
// import { ActivityForm, ActivityList } from '.';
// import { useDeleteActivityItem, useUpdateActivityItem } from '../hooks/useQueries';
// import { useAuth } from '../utils/auth';
// import { toast } from 'react-toastify';

// interface ActivitySectionProps {
//   activities: any[];
//   currentPage: number;
//   totalPages: number;
//   onSubmit: (description: string) => Promise<void>;
//   onPreviousPage: () => void;
//   onNextPage: () => void;
// }

// export const ActivitySection = ({
//   activities,
//   currentPage,
//   totalPages,
//   onSubmit,
//   onPreviousPage,
//   onNextPage
// }: ActivitySectionProps) => {
//   const { authUser } = useAuth();
//   const deleteActivityMutation = useDeleteActivityItem();
//   const updateActivityMutation = useUpdateActivityItem();

//   const handleDeleteActivityItem = async (activityId: string, index: number) => {
//     if (!authUser?.token) {
//       toast.error('Authentication required');
//       return;
//     }

//     // Confirm before deleting
//     if (window.confirm('Are you sure you want to delete this activity item?')) {
//       try {
//         await deleteActivityMutation.mutateAsync({
//           token: authUser.token,
//           activityId,
//           index
//         });
//         toast.success('Activity item deleted successfully');
//       } catch (error) {
//         console.error('Error deleting activity item:', error);
//         toast.error('Failed to delete activity item. Please try again later.');
//         // Error toast will be handled by the hook
//       }
//     }
//   };

//   const handleUpdateActivityItem = async (activityId: string, index: number, description: string) => {
//     if (!authUser?.token) {
//       toast.error('Authentication required');
//       return;
//     }

//     if (!description.trim()) {
//       toast.error('Description cannot be empty');
//       return;
//     }

//     try {
//       await updateActivityMutation.mutateAsync({
//         token: authUser.token,
//         activityId,
//         index,
//         description: description.trim()
//       });
//       toast.success('Activity item updated successfully');
//     } catch (error) {
//       console.error('Error updating activity item:', error);
//       // Error toast will be handled by the hook
//       toast.error('Failed to update activity item. Please try again later.');
//     }
//   };

//   return (
//     <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
//       <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Activities</h2>
//       <ActivityForm onSubmit={onSubmit} />
//       <div className="mt-4 sm:mt-6">
//         <ActivityList
//           activities={activities}
//           onDeleteItem={handleDeleteActivityItem}
//           onUpdateItem={handleUpdateActivityItem}
//           isDeleting={deleteActivityMutation.isPending}
//           isUpdating={updateActivityMutation.isPending}
//         />
//       </div>

//       <div className="flex items-center justify-between mt-6 gap-4">
//         <button
//           onClick={onPreviousPage}
//           disabled={currentPage === 1}
//           className="px-3 sm:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm sm:text-base"
//         >
//           Previous
//         </button>
//         <span className="text-sm sm:text-base text-gray-600">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           onClick={onNextPage}
//           disabled={currentPage === totalPages}
//           className="px-3 sm:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm sm:text-base"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };