
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { styleFacade } from '@/services/styles';

interface StyleShowcaseProps {
  onStyleSelect: (styleId: string) => void;
}

export const StyleShowcase: React.FC<StyleShowcaseProps> = ({ onStyleSelect }) => {
  const recommendedStyles = styleFacade.getRecommendedStyles();
  const allStyles = styleFacade.getAllStyles();
  
  const formatStyles = styleFacade.getAllStyles('format');
  const toneStyles = styleFacade.getAllStyles('tone');
  const specialStyles = allStyles.filter(style => 
    style.category === 'special' || 
    style.category === 'language' ||
    style.category === 'custom'
  );
  
  const StyleButton: React.FC<{ style: any }> = ({ style }) => (
    <Button 
      key={style.id} 
      variant="outline" 
      size="sm"
      onClick={() => onStyleSelect(style.id)}
      className="text-sm rounded-full bg-[#ecd9ba]/[0.13] hover:bg-[#ecd9ba]/[0.3] border-coffee text-coffee"
    >
      {style.name}
    </Button>
  );
  
  return (
    <Card className="w-full shadow-sm border-0 bg-white/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-[#5d4a1d]">Choose a Style</CardTitle>
        <CardDescription>Select how you want your content transformed</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommended">
          <TabsList className="mb-3 bg-[#ecd9ba]/[0.2]">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="tone">Tone</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="p-1">
            <div className="flex flex-wrap gap-2">
              {recommendedStyles.map(style => (
                <StyleButton key={style.id} style={style} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="format" className="p-1">
            <div className="flex flex-wrap gap-2">
              {formatStyles.map(style => (
                <StyleButton key={style.id} style={style} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tone" className="p-1">
            <div className="flex flex-wrap gap-2">
              {toneStyles.map(style => (
                <StyleButton key={style.id} style={style} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="special" className="p-1">
            <div className="flex flex-wrap gap-2">
              {specialStyles.map(style => (
                <StyleButton key={style.id} style={style} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StyleShowcase;
