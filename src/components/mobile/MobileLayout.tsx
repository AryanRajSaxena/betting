import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileUserProfile } from './MobileUserProfile';
import { MobileEventCard } from './MobileEventCard';
import { MobileBettingModal } from './MobileBettingModal';
import { PaymentManagement } from '../PaymentManagement';
import { Leaderboard } from '../Leaderboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import { CreateEventModal } from '../CreateEventModal';
import { WinningAnimation } from '../WinningAnimation';
import { CompletedEventsSection } from '../CompletedEventsSection';
import { Event, User, Bet, Transaction, PaymentMethod } from '../../types';
import { Search, Filter, Plus, TrendingUp, Trophy, Sparkles } from 'lucide-react';

interface MobileLayoutProps {
  currentUser: User & { netPL?: number };
  events: Event[];
  userBets: Bet[];
  userBetsByEvent: { [eventId: string]: Bet };
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  onSignOut: () => void;
  onPlaceBet: (eventId: string, optionId: string, amount: number) => void;
  onCreateEvent: (eventData: any) => void;
  onAddMoney: (amount: number, methodId: string) => void;
  onWithdraw: (amount: number, methodId: string) => void;
  onRefreshEvents: () => void;
  showWinningAnimation: boolean;
  winningAnimationData: any;
  onCloseWinningAnimation: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  currentUser,
  events,
  userBets,
  userBetsByEvent,
  transactions,
  paymentMethods,
  onSignOut,
  onPlaceBet,
  onCreateEvent,
  onAddMoney,
  onWithdraw,
  onRefreshEvents,
  showWinningAnimation,
  winningAnimationData,
  onCloseWinningAnimation
}) => {
  const [currentView, setCurrentView] = useState<'events' | 'payments' | 'leaderboard' | 'admin'>('events');
  const [eventsTab, setEventsTab] = useState<'active' | 'completed'>('active');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'ending'>('newest');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ['All', 'Weather', 'Cryptocurrency', 'Sports', 'Technology', 'Finance', 'Politics', 'Entertainment'];

  // Separate active and resolved events
  const activeEvents = events.filter(event => event.status === 'active');
  const resolvedEvents = events.filter(event => event.status === 'resolved');

  const filteredActiveEvents = activeEvents
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      if (currentUser?.isAdmin) {
        return matchesSearch && matchesCategory;
      } else {
        const hasUserBet = userBetsByEvent[event.id];
        const isActiveEvent = event.status === 'active';
        return matchesSearch && matchesCategory && (hasUserBet || isActiveEvent);
      }
    })
    .sort((a, b) => {
      const aHasUserBet = userBetsByEvent[a.id] ? 1 : 0;
      const bHasUserBet = userBetsByEvent[b.id] ? 1 : 0;
      if (aHasUserBet !== bHasUserBet) {
        return bHasUserBet - aHasUserBet;
      }
      switch (sortBy) {
        case 'popular':
          return b.participantCount - a.participantCount;
        case 'ending':
          return a.expiresAt.getTime() - b.expiresAt.getTime();
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const filteredResolvedEvents = resolvedEvents
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      if (currentUser?.isAdmin) {
        return matchesSearch && matchesCategory;
      } else {
        const hasUserBet = userBetsByEvent[event.id];
        return matchesSearch && matchesCategory && hasUserBet;
      }
    })
    .sort((a, b) => (b.resolvedAt?.getTime() || 0) - (a.resolvedAt?.getTime() || 0));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderEventsContent = () => (
    <div className="pb-20">
      {/* User Profile Section */}
      <div className="p-4">
        <MobileUserProfile user={currentUser} userBets={userBets} />
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              eventsTab === 'active'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-lg'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => setEventsTab('active')}
          >
            Active Events
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              eventsTab === 'completed'
                ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-300 shadow-lg'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => setEventsTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300/60 dark:border-slate-600/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300/60 dark:border-slate-600/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'ending')}
            className="flex-1 px-4 py-3 border border-slate-300/60 dark:border-slate-600/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="ending">Ending Soon</option>
          </select>
        </div>
      </div>

      {/* Admin Create Button */}
      {currentUser.isAdmin && eventsTab === 'active' && (
        <div className="px-4 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create New Event
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="px-4 space-y-4">
        {eventsTab === 'active' ? (
          <>
            {filteredActiveEvents.length > 0 ? (
              filteredActiveEvents.map((event) => (
                <MobileEventCard
                  key={event.id}
                  event={event}
                  userBet={userBetsByEvent[event.id] || null}
                  onBet={setSelectedEvent}
                  isAdmin={currentUser.isAdmin}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-400 dark:text-slate-500 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No active events found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || selectedCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : currentUser.isAdmin
                      ? 'Create your first event to get started!'
                      : 'No active events available at the moment'
                  }
                </p>
              </div>
            )}
          </>
        ) : (
          <CompletedEventsSection
            resolvedEvents={filteredResolvedEvents}
            userBets={userBets}
            userBetsByEvent={userBetsByEvent}
            onEventClick={setSelectedEvent}
            isAdmin={currentUser.isAdmin}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Mobile Header */}
      <MobileHeader
        user={currentUser}
        onSignOut={onSignOut}
        onMenuToggle={setIsMenuOpen}
      />

      {/* Main Content */}
      <main className="relative">
        {currentView === 'events' && renderEventsContent()}
        
        {currentView === 'leaderboard' && (
          <div className="pb-20">
            <Leaderboard currentUser={currentUser} />
          </div>
        )}
        
        {currentView === 'payments' && (
          <div className="pb-20">
            <PaymentManagement
              userId={currentUser.id}
              currentBalance={currentUser.balance}
              transactions={transactions}
              paymentMethods={paymentMethods}
              onAddMoney={onAddMoney}
              onWithdraw={onWithdraw}
            />
          </div>
        )}
        
        {currentView === 'admin' && currentUser.isAdmin && (
          <div className="pb-20">
            <AdminDashboard
              events={events}
              currentUser={currentUser}
              onCreateEvent={onCreateEvent}
              onRefreshEvents={onRefreshEvents}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav
        activeTab={currentView}
        onTabChange={(tab) => setCurrentView(tab as any)}
        isAdmin={currentUser.isAdmin}
      />

      {/* Modals */}
      {selectedEvent && (
        <MobileBettingModal
          event={selectedEvent}
          userBalance={currentUser.balance}
          isAdmin={currentUser.isAdmin}
          onClose={() => setSelectedEvent(null)}
          onPlaceBet={onPlaceBet}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreateEvent={onCreateEvent}
        />
      )}

      {showWinningAnimation && winningAnimationData && (
        <WinningAnimation
          isVisible={showWinningAnimation}
          onClose={onCloseWinningAnimation}
          winAmount={winningAnimationData.winAmount}
          eventTitle={winningAnimationData.eventTitle}
          streak={winningAnimationData.streak}
        />
      )}
    </div>
  );
};