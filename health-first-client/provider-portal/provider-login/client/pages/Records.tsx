import EHRLayout from '@/components/EHRLayout';
import PlaceholderPage from '@/components/PlaceholderPage';

export default function Records() {
  return (
    <EHRLayout>
      <PlaceholderPage 
        title="Medical Records" 
        description="Access and manage comprehensive medical records, lab results, and diagnostic reports."
      />
    </EHRLayout>
  );
}
