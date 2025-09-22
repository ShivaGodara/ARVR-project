// Check if user has collected all badges
const collectedBadges = JSON.parse(localStorage.getItem('collectedBadges') || '[]');
const hasCompletedGame = collectedBadges.length >= 5;

// Always initialize stream, but show different content based on completion status
initializeStream();

function initializeStream() {
    // Display collected badges and completion status
    const badgeInventory = document.getElementById('badgeInventory');
    if (hasCompletedGame) {
        badgeInventory.innerHTML = `<div style="color: #00ff00; font-weight: bold; margin-bottom: 10px;">✅ ALL GAMES COMPLETED!</div>` + collectedBadges.map(badge => `${badge.icon} ${badge.name}`).join('<br>');
    } else {
        badgeInventory.innerHTML = `<div style="margin-bottom: 10px;">Collected: ${collectedBadges.length}/5</div>` + collectedBadges.map(badge => `${badge.icon} ${badge.name}`).join('<br>');
    }

    // Achievement data
    const achievements = [
        { 
            name: 'Mars Mission 2014', 
            icon: '🚀', 
            event: 'Mangalyaan reached Mars orbit - First country to succeed on first attempt! This historic achievement made India the fourth space agency to reach Mars and the first to do so in their maiden attempt.',
            year: '2014'
        },
        { 
            name: 'Vaccination Drive 2021', 
            icon: '💉', 
            event: 'World\'s largest vaccination drive - 2+ billion doses! India administered over 2 billion COVID-19 vaccine doses, demonstrating unprecedented healthcare logistics and planning.',
            year: '2021'
        },
        { 
            name: 'Solar Power 2022', 
            icon: '☀️', 
            event: '4th largest renewable energy capacity globally! India has become a world leader in renewable energy with massive solar installations and green energy initiatives.',
            year: '2022'
        },
        { 
            name: 'Digital Payments 2016', 
            icon: '💳', 
            event: 'UPI revolutionized digital payments in India! The Unified Payments Interface transformed India into a global leader in digital transactions with over 8 billion monthly transactions.',
            year: '2016'
        },
        { 
            name: 'Startup Hub 2023', 
            icon: '🦄', 
            event: '100+ unicorn startups - 3rd largest ecosystem! India now hosts over 100 unicorn companies, making it the third-largest startup ecosystem in the world.',
            year: '2023'
        }
    ];

    // Create achievement cards
    const cardsContainer = document.getElementById('achievementCards');
    
    achievements.forEach((achievement, index) => {
        const isUnlocked = collectedBadges.some(badge => badge.name === achievement.name);
        const canAccess = hasCompletedGame || isUnlocked;
        
        const card = document.createElement('div');
        card.className = `achievement-card ${canAccess ? 'unlocked' : ''}`;
        card.innerHTML = `
            <div class="card-icon">${achievement.icon}</div>
            <div class="card-title">${achievement.name}</div>
            <div class="card-description">${achievement.event}</div>
            <div class="card-status ${canAccess ? 'status-unlocked' : 'status-locked'}">
                ${canAccess ? (isUnlocked ? '🏆 BADGE EARNED - Click to View' : '✅ UNLOCKED - Click to View Details') : '🔒 Complete Game to Unlock'}
            </div>
        `;
        
        if (canAccess) {
            if (achievement.name === 'Mars Mission 2014') {
                card.addEventListener('click', () => window.location.href = 'marsmission/index.html');
            } else if (achievement.name === 'Vaccination Drive 2021') {
                card.addEventListener('click', () => window.location.href = 'covid_vaccine/vaccination_index.html.html');
            } else if (achievement.name === 'Solar Power 2022') {
                card.addEventListener('click', () => window.location.href = 'solar_power/index.html');
            } else {
                card.addEventListener('click', () => showAchievementModal(achievement, isUnlocked));
            }
            card.style.cursor = 'pointer';
        } else {
            card.style.opacity = '0.6';
            card.style.cursor = 'not-allowed';
        }
        
        cardsContainer.appendChild(card);
        
        // Add staggered animation
        setTimeout(() => {
            card.style.animation = `fadeInUp 0.6s ease-out forwards`;
        }, index * 200);
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .achievement-card {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
}

function showAchievementModal(achievement, hasBadge = false) {
    const modalContent = document.getElementById('modalContent');
    const statusText = hasBadge ? 'BADGE EARNED!' : 'ACHIEVEMENT UNLOCKED!';
    const statusColor = hasBadge ? 'linear-gradient(135deg, #ffd700, #ff6b35)' : 'linear-gradient(135deg, #ff6b35, #138808)';
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 60px; margin-bottom: 10px;">${achievement.icon}</div>
            <h2 style="color: #000080; margin-bottom: 10px; font-size: 28px;">${achievement.name}</h2>
            <div style="background: ${statusColor}; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold; margin-bottom: 10px;">${statusText}</div>
            <div style="color: #666; font-size: 16px; font-weight: bold;">Year: ${achievement.year}</div>
            ${!hasCompletedGame ? '<div style="color: #ff6b35; font-size: 14px; margin-top: 5px; font-style: italic;">Complete all games to unlock full access</div>' : ''}
        </div>
        <div style="width: 100%; height: 300px; background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%); border: 3px dashed #ff6b35; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; border-radius: 15px;">
            <div style="text-align: center; color: #666;">
                <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                <div style="font-size: 18px; font-weight: bold;">Documentary Video</div>
                <div style="font-size: 14px; margin-top: 5px; color: #ff6b35;">Learn more about ${achievement.name}</div>
            </div>
        </div>
        <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: left;">${achievement.event}</p>
        <div style="margin-top: 20px; text-align: center;">
            ${achievement.name === 'Mars Mission 2014' ? '<a href="marsmission/index.html" style="background: linear-gradient(135deg, #ff6b35, #138808); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; text-decoration: none; margin-right: 10px;">🚀 Explore Mars Mission</a>' : ''}
            ${!hasCompletedGame ? '<a href="game.html" style="background: linear-gradient(135deg, #ff6b35, #138808); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; text-decoration: none; margin-right: 10px;">Play Games</a>' : ''}
            <button onclick="closeModal()" style="background: linear-gradient(135deg, #ff6b35, #138808); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer;">Continue Journey</button>
        </div>
    `;
    
    document.getElementById('achievementModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('achievementModal').style.display = 'none';
}

// Add smooth scrolling for better navigation
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.achievement-card');
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        observer.observe(card);
    });
});