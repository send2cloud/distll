
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryTab from './SummaryTab';
import OriginalContentTab from './OriginalContentTab';

interface ContentTabsProps {
  summary: string;
  originalContent: string;
  url: string;
}

/**
 * A component that provides tabs for different views of the content
 * (summary and original)
 */
const ContentTabs = ({ summary, originalContent, url }: ContentTabsProps) => {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="original">Original Content</TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary" className="mt-0">
        <SummaryTab summary={summary} url={url} />
      </TabsContent>
      
      <TabsContent value="original" className="mt-0">
        <OriginalContentTab originalContent={originalContent} url={url} />
      </TabsContent>
    </Tabs>
  );
};

export default ContentTabs;
