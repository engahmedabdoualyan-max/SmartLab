import { TestModeTabsSimple as TestModeTabs } from '@/components/tests/TestModeTabsSimple';
import { getTestTemplate } from '@/lib/test-templates';

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const template = getTestTemplate('marshall');
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slab-text-primary">{template?.name}</h1>
        <p className="text-slab-text-secondary mt-1">{template?.standard} - {template?.category}</p>
      </div>
      
      <TestModeTabs 
        templateId={template?.id || 'marshall-stability'} 
        projectId="project-1" 
      />
    </div>
  );
}