import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// All 12 Official Pages
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ReportProblemPage from './pages/ReportProblemPage';
import AiResultPage from './pages/AiResultPage';
import ChallengesExplorerPage from './pages/ChallengesExplorerPage';
import UniversityDashboardPage from './pages/UniversityDashboardPage';
import IndustryDashboardPage from './pages/IndustryDashboardPage';
import GovernmentDashboardPage from './pages/GovernmentDashboardPage';
import ProjectWorkspacePage from './pages/ProjectWorkspacePage';
import ImpactPage from './pages/ImpactPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [pendingScreen, setPendingScreen] = useState(null);

  // Dashboards that require institutional login
  const institutionalPortals = ['university', 'industry', 'government', 'workspace'];

  // Centralized authentication completion handler
  const handleAuthSuccess = (user, customTarget = null) => {
    setCurrentUser(user);
    const target = customTarget || pendingScreen;
    setPendingScreen(null);

    // Direct user to intended destination based on role or pending intent
    if (target && target !== 'login' && target !== 'signup') {
      setActiveScreen(target);
    } else if (user.role === 'University') {
      setActiveScreen('university');
    } else if (user.role === 'Industry') {
      setActiveScreen('industry');
    } else if (user.role === 'Government') {
      setActiveScreen('government');
    } else {
      setActiveScreen('home');
    }
  };

  // Safe navigation handler that avoids state updates during React render
  const navigateTo = (screenId) => {
    if (!currentUser && institutionalPortals.includes(screenId)) {
      setPendingScreen(screenId);
      setActiveScreen('login');
    } else {
      setActiveScreen(screenId);
    }
  };

  const renderActiveScreen = () => {
    // If an unauthenticated user directly hits an institutional dashboard, render LoginPage safely
    if (!currentUser && institutionalPortals.includes(activeScreen)) {
      return (
        <LoginPage 
          setActiveScreen={navigateTo} 
          setCurrentUser={setCurrentUser} 
          pendingScreen={activeScreen}
          setPendingScreen={setPendingScreen}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    switch (activeScreen) {
      case 'home':
        return <HomePage setActiveScreen={navigateTo} currentUser={currentUser} />;
      case 'signup':
        return (
          <SignUpPage 
            setActiveScreen={navigateTo} 
            setCurrentUser={setCurrentUser} 
            pendingScreen={pendingScreen}
            setPendingScreen={setPendingScreen}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case 'login':
        return (
          <LoginPage 
            setActiveScreen={navigateTo} 
            setCurrentUser={setCurrentUser} 
            pendingScreen={pendingScreen}
            setPendingScreen={setPendingScreen}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case 'report':
        return (
          <ReportProblemPage 
            setActiveScreen={navigateTo} 
            setLatestReport={setLatestReport} 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser} 
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case 'ai-result':
        return <AiResultPage setActiveScreen={navigateTo} latestReport={latestReport} />;
      case 'challenges':
        return <ChallengesExplorerPage setActiveScreen={navigateTo} currentUser={currentUser} />;
      case 'university':
        return <UniversityDashboardPage setActiveScreen={navigateTo} />;
      case 'industry':
        return <IndustryDashboardPage setActiveScreen={navigateTo} />;
      case 'government':
        return <GovernmentDashboardPage setActiveScreen={navigateTo} />;
      case 'workspace':
        return <ProjectWorkspacePage setActiveScreen={navigateTo} />;
      case 'impact':
        return <ImpactPage setActiveScreen={navigateTo} />;
      case 'about':
        return <AboutPage setActiveScreen={navigateTo} />;
      default:
        return <HomePage setActiveScreen={navigateTo} currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeScreen={activeScreen} 
        setActiveScreen={navigateTo} 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
      
      <main className="main-content">
        {renderActiveScreen()}
      </main>

      <Footer setActiveScreen={navigateTo} />
    </div>
  );
}
