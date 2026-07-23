import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from './App';
import { Overview } from '@/pages/Overview';
import { Players } from '@/pages/Players';
import { MatchEntries } from '@/pages/MatchEntries';
import { Matches } from '@/pages/Matches';
import { News } from '@/pages/News';
import { NewsDetail } from '@/pages/NewsDetail';
import { HallOfFame } from '@/pages/HallOfFame';
import { Compare } from '@/pages/Compare';
import { Leaderboard } from '@/pages/Leaderboard';
import { ClubInfo } from '@/pages/ClubInfo';
import { Gallery } from '@/pages/Gallery';

// A proxy component so Overview can still call `setTab` logically, mapped to navigate since we use React Router now.
function OverviewRouterProxy() {
  const navigate = useNavigate();
  return <Overview setTab={(tab) => navigate(`/${tab}`)} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewRouterProxy /> },
      { path: "players", element: <Players /> },
      { path: "entries", element: <MatchEntries /> },
      { path: "matches", element: <Matches /> },
      { path: "compare", element: <Compare /> },
      { path: "leaderboard", element: <Leaderboard /> },
      { path: "news", element: <News /> },
      { path: "news/:id", element: <NewsDetail /> },
      { path: "hall-of-fame", element: <HallOfFame /> },
      { path: "club-info", element: <ClubInfo /> },
      { path: "gallery", element: <Gallery /> },
    ]
  }
]);
