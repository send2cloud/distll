
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentTabProps {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

/**
 * A reusable content tab component that provides consistent styling and layout
 * for different types of content displays
 */
const ContentTab = ({ title, headerActions, children }: ContentTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        {headerActions}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default ContentTab;
