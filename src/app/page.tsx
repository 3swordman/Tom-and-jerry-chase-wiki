'use client';

import { useState } from 'react';
import NavigationWrapper from '@/components/NavigationWrapper';
import FactionCharacters from '@/components/FactionCharacters';
import CharacterDetails from '@/components/CharacterDetails';
import { factions, characters } from '@/data/mockData';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isDetailedView, setIsDetailedView] = useState<boolean>(false);

  const handleTabChange = (tabId: string) => {
    // If tabId is empty string, set activeTab to null (home page)
    setActiveTab(tabId === '' ? null : tabId);
    setSelectedCharacter(null);
  };

  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const toggleDetailedView = () => {
    setIsDetailedView(!isDetailedView);
  };

  // Render content based on state
  const renderContent = () => {
    // If a character is selected, show character details
    if (selectedCharacter && characters[selectedCharacter]) {
      // Pass the isDetailedView state to the CharacterDetails component
      return (
        <CharacterDetails
          character={characters[selectedCharacter]}
          isDetailedView={isDetailedView}
        />
      );
    }

    // If a faction tab is active, show faction characters
    if (activeTab && factions[activeTab]) {
      return (
        <FactionCharacters
          faction={factions[activeTab]}
          onSelectCharacter={handleSelectCharacter}
        />
      );
    }

    // Default: show home page content
    return (
      <div className="space-y-10"> {/* Padding for navbar is now handled at the page level */}
        <header className="text-center space-y-6 px-4">
          <h1 className="text-4xl font-bold text-blue-600 py-3">猫和老鼠手游wiki</h1>
          <p className="text-xl text-gray-600 px-4 py-2">
            查询角色技能和属性
          </p>
        </header>

        <div className="flex flex-col items-center mt-16 px-4">
          <h2 className="text-3xl font-bold mb-10 py-3" style={{ color: '#1f2937' }}>选择阵营</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: '24px',
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto'
          }} className="flex-row sm:flex-row">
            <button
              onClick={() => handleTabChange('cat')}
              aria-label="查看猫阵营角色列表"
              className="faction-button"
              style={{
                padding: '16px 24px',
                borderRadius: '8px',
                backgroundColor: '#e5e7eb', // Gray background like inactive nav button
                color: '#1f2937', // Dark text like inactive nav button
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: 1,
                minWidth: '220px',
                position: 'relative',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.75rem' }}>🐱</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>猫阵营</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                查看猫阵营角色列表
              </div>
            </button>

            <button
              onClick={() => handleTabChange('mouse')}
              aria-label="查看鼠阵营角色列表"
              className="faction-button"
              style={{
                padding: '16px 24px',
                borderRadius: '8px',
                backgroundColor: '#e5e7eb', // Gray background like inactive nav button
                color: '#1f2937', // Dark text like inactive nav button
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: 1,
                minWidth: '220px',
                position: 'relative',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.75rem' }}>🐭</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>鼠阵营</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                查看鼠阵营角色列表
              </div>
            </button>
          </div>
        </div>

        <div className="mt-16 text-center px-4">
          <h2 className="text-2xl font-bold mb-6 py-2">网站说明</h2>
          <p className="max-w-2xl mx-auto text-gray-600 px-4 py-3">
            本网站为粉丝制作，仅供学习交流使用，并非官方网站。数据仅供参考，实际数值可能因版本更新而变化。
          </p>
        </div>
      </div>
    );
  };

  return (
    <NavigationWrapper
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isDetailedView={isDetailedView}
      onToggleDetailedView={toggleDetailedView}
      showDetailToggle={!!selectedCharacter} // Only show toggle when a character is selected
    >
      {/* Render content based on state */}
      {renderContent()}
    </NavigationWrapper>
  );
}
