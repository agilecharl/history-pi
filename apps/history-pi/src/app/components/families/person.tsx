// pages/PersonPage.tsx
import { useParams } from 'react-router-dom';
/*import LoadingSpinner from '../components/LoadingSpinner';
import PersonCard from '../components/PersonCard';
import PhotoGallery from '../components/PhotoGallery';
import Timeline from '../components/Timeline';
import { usePerson } from '../hooks/usePerson';*/

const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  /*const { person, loading, error } = usePerson(id);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">Error loading person</div>;
*/
  return (
    <div>
      {/*    <PersonCard person={person!} />
      <Timeline events={person!.events} />
      <PhotoGallery photos={person!.photos} />*/}
    </div>
  );
};

export default PersonPage;
