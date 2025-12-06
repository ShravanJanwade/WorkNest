"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit,
  User,
  Flag,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DottedSeparator } from "@/components/dotted-separator";

import { useGetActivity } from "../api/use-get-activity";
import { ActivityLogWithUser, ActivityAction } from "../types";

const actionConfig: Record<
  ActivityAction,
  { icon: any; label: string; color: string }
> = {
  created: {
    icon: Plus,
    label: "created this task",
    color: "text-green-600 bg-green-100",
  },
  updated: {
    icon: Edit,
    label: "updated this task",
    color: "text-blue-600 bg-blue-100",
  },
  deleted: {
    icon: Trash2,
    label: "deleted",
    color: "text-red-600 bg-red-100",
  },
  status_changed: {
    icon: ArrowRightLeft,
    label: "changed status",
    color: "text-purple-600 bg-purple-100",
  },
  priority_changed: {
    icon: Flag,
    label: "changed priority",
    color: "text-orange-600 bg-orange-100",
  },
  assignee_changed: {
    icon: User,
    label: "changed assignee",
    color: "text-indigo-600 bg-indigo-100",
  },
  comment_added: {
    icon: MessageSquare,
    label: "added a comment",
    color: "text-cyan-600 bg-cyan-100",
  },
  time_logged: {
    icon: Clock,
    label: "logged time",
    color: "text-teal-600 bg-teal-100",
  },
  sprint_changed: {
    icon: CheckCircle2,
    label: "changed sprint",
    color: "text-pink-600 bg-pink-100",
  },
};

interface ActivityTimelineProps {
  taskId: string;
}

export const ActivityTimeline = ({ taskId }: ActivityTimelineProps) => {
  const { data, isLoading } = useGetActivity({ taskId });

  const getActionDetails = (activity: ActivityLogWithUser) => {
    const config = actionConfig[activity.action] || {
      icon: Activity,
      label: activity.action,
      color: "text-gray-600 bg-gray-100",
    };

    let description = config.label;

    if (activity.field) {
      if (activity.oldValue && activity.newValue) {
        description = `changed ${activity.field} from "${activity.oldValue}" to "${activity.newValue}"`;
      } else if (activity.newValue) {
        description = `set ${activity.field} to "${activity.newValue}"`;
      }
    }

    return { ...config, description };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Activity</h3>
      </div>

      <DottedSeparator />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : data?.documents && data.documents.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {data.documents.map((activity, index) => {
              const { icon: Icon, color, description } = getActionDetails(activity);
              const initials = activity.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={activity.$id} className="flex gap-3 relative">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full z-10 shrink-0",
                      color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-gray-200">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm text-gray-900">
                        {activity.user.name}
                      </span>
                      <span className="text-sm text-gray-600">{description}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(activity.$createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No activity yet</p>
          <p className="text-xs text-gray-400">Changes to this task will appear here</p>
        </div>
      )}
    </div>
  );
};
