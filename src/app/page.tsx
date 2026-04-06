'use client';

import { useAppStore } from '@/lib/store';
import LandingPage from '@/components/layout/LandingPage';
import ConfigPanel from '@/components/layout/ConfigPanel';
import ChatPage from '@/components/chat/ChatPage';
import ViewerPage from '@/components/viewer/ViewerPage';
import GeneratingScreen from '@/components/layout/GeneratingScreen';

export default function Home() {
  const currentStep = useAppStore((s) => s.currentStep);

  switch (currentStep) {
    case 'landing':
      return <LandingPage />;
    case 'config':
      return <ConfigPanel />;
    case 'chat':
      return <ChatPage />;
    case 'generating':
      return <GeneratingScreen />;
    case 'viewer':
      return <ViewerPage />;
    default:
      return <LandingPage />;
  }
}
