import { Check, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming";
}

interface TimelineStepperProps {
  steps: TimelineStep[];
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function TimelineStepper({ steps, className, orientation = "vertical" }: TimelineStepperProps) {
  if (orientation === "horizontal") {
      return (
        <div className={cn("flex w-full items-start justify-between", className)}>
            {steps.map((step, index) => (
                <div key={step.id} className="relative flex flex-1 flex-col items-center">
                    {/* Connector Line (Horizontal) */}
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "absolute left-[50%] top-4 h-0.5 w-full",
                                step.status === "completed" ? "bg-status-success" : "bg-border"
                            )}
                        />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 mb-2 flex h-8 w-8 shrink-0 items-center justify-center bg-background">
                        {step.status === "completed" ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-success text-primary-foreground">
                                <Check className="h-4 w-4" />
                            </div>
                        ) : step.status === "current" ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                                <Circle className="h-3 w-3 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="text-center">
                        <p
                            className={cn(
                                "text-xs font-medium",
                                step.status === "completed" && "text-muted-foreground",
                                step.status === "current" && "text-foreground",
                                step.status === "upcoming" && "text-muted-foreground"
                            )}
                        >
                            {step.label}
                        </p>
                         {step.timestamp && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {step.timestamp}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
      );
  }

  // Vertical (Default)
  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex gap-4">
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "absolute left-[15px] top-8 h-full w-0.5",
                step.status === "completed" ? "bg-status-success" : "bg-border"
              )}
            />
          )}

          {/* Icon */}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center bg-background">
             {/* Added bg-background to hide line behind icon */}
            {step.status === "completed" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-success text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
            ) : step.status === "current" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                <Circle className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-8">
            <p
              className={cn(
                "text-sm font-medium leading-8",
                step.status === "completed" && "text-muted-foreground",
                step.status === "current" && "text-foreground",
                step.status === "upcoming" && "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {step.description}
              </p>
            )}
            {step.timestamp && (
              <p className="mt-1 text-xs text-muted-foreground">
                {step.timestamp}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
