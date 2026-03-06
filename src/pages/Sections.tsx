import SectionPage from './SectionPage';
import AcademicPage from './AcademicPage';

export const Courses = () => <SectionPage categoryId={1} />;
export const Entertainment = () => <SectionPage categoryId={2} />;
export const SocialMedia = () => <SectionPage categoryId={4} />;
export const AiTools = () => <SectionPage categoryId={6} />;
export const Academic = () => <AcademicPage />;
export const CalendarPage = () => <SectionPage categoryId={8} />;
