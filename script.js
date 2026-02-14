// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ナビゲーションバーのスクロール効果
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// スクロールアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .teacher-card, .pricing-card, .event-card');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
});

// モバイルメニュー
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// フォーム送信
const trialForm = document.getElementById('trialForm');

if (trialForm) {
    trialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // フォームデータを取得
        const formData = new FormData(trialForm);
        const data = Object.fromEntries(formData.entries());
        
        // メール送信先
        const emailTo = 'alckids2018@gmail.com';
        
        // メール本文を作成
        const subject = encodeURIComponent('【無料体験レッスン申込】');
        const body = encodeURIComponent(`
保護者様のお名前: ${data.parentName}
お子様のお名前: ${data.childName}
お子様の年齢: ${data.childAge}歳
ご希望のコース: ${data.course}
メールアドレス: ${data.email}
電話番号: ${data.phone}
ご質問・ご要望:
${data.message || 'なし'}
        `);
        
        // メールクライアントを開く
        window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
        
        // 実際のアプリケーションでは、ここでサーバーにデータを送信します
        console.log('フォームデータ:', data);
        
        // 成功メッセージを表示
        showSuccessMessage();
        
        // フォームをリセット
        trialForm.reset();
    });
}

function showSuccessMessage() {
    // 成功メッセージの作成
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>お申し込みありがとうございます！</h3>
            <p>担当者より2営業日以内にご連絡させていただきます。</p>
        </div>
    `;
    
    // スタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .success-content {
            background: white;
            padding: 48px;
            border-radius: 24px;
            text-align: center;
            max-width: 500px;
            animation: scaleIn 0.3s ease-out;
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            margin: 0 auto 24px;
        }
        
        .success-content h3 {
            font-family: 'Fredoka', sans-serif;
            font-size: 28px;
            margin-bottom: 16px;
            color: #2D3748;
        }
        
        .success-content p {
            color: #718096;
            font-size: 16px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { 
                opacity: 0;
                transform: scale(0.9);
            }
            to { 
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(messageDiv);
    
    // 3秒後にメッセージを削除
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            messageDiv.remove();
            style.remove();
        }, 300);
    }, 3000);
    
    // CSS fadeOut アニメーション
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
}

// 数字のカウントアップアニメーション（ヒーローセクションの統計）
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        const value = Math.floor(progress * (end - start) + start);
        
        if (element.textContent.includes('%')) {
            element.textContent = value + '%';
        } else if (element.textContent.includes('+')) {
            element.textContent = value + '+';
        } else {
            element.textContent = value + '年';
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 統計数字のアニメーションを開始
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                let endValue = 0;
                
                if (text.includes('+')) {
                    endValue = parseInt(text);
                } else if (text.includes('%')) {
                    endValue = parseInt(text);
                } else {
                    endValue = parseInt(text);
                }
                
                animateValue(stat, 0, endValue, 2000);
            });
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// パララックス効果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-shape');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
});

// ページロード時のアニメーション
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// レスポンシブメニューのスタイル追加
const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 24px;
            gap: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            animation: slideDown 0.3s ease-out;
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translateY(10px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translateY(-10px);
        }
    }
`;
document.head.appendChild(mobileMenuStyle);

// イベント画像アップロード機能
let eventIdCounter = 4; // サンプルイベントの次のID

// 画像アップロード処理
const eventImageUpload = document.getElementById('eventImageUpload');
const uploadLabel = document.querySelector('.upload-label');
const eventsGallery = document.getElementById('eventsGallery');

if (eventImageUpload && uploadLabel) {
    // ファイル選択時
    eventImageUpload.addEventListener('change', handleFileSelect);
    
    // ドラッグ&ドロップ
    uploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadLabel.style.background = '#F0F4FF';
        uploadLabel.style.borderColor = '#E5558A';
    });
    
    uploadLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadLabel.style.background = '';
        uploadLabel.style.borderColor = '';
    });
    
    uploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadLabel.style.background = '';
        uploadLabel.style.borderColor = '';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        // JPGファイルのみ許可
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                showEventModal(e.target.result);
            };
            
            reader.readAsDataURL(file);
        } else {
            alert('JPGファイルのみアップロード可能です。');
        }
    });
}

// イベント追加モーダルを表示
function showEventModal(imageData) {
    // モーダルを作成
    const modal = document.createElement('div');
    modal.className = 'event-modal active';
    modal.innerHTML = `
        <div class="event-modal-content">
            <div class="event-modal-header">
                <h3 class="event-modal-title">イベント情報を入力</h3>
                <button class="event-modal-close" onclick="closeEventModal(this)">&times;</button>
            </div>
            <div class="event-modal-preview">
                <img src="${imageData}" alt="プレビュー">
            </div>
            <form class="event-modal-form" onsubmit="saveEvent(event, '${imageData}')">
                <div class="form-group">
                    <label>イベントタイトル <span class="required">*</span></label>
                    <input type="text" name="title" required placeholder="例: ハロウィンパーティー 2024">
                </div>
                <div class="form-group">
                    <label>開催日 <span class="required">*</span></label>
                    <input type="text" name="date" required placeholder="例: 2024年10月">
                </div>
                <div class="form-group">
                    <label>説明</label>
                    <textarea name="description" rows="3" placeholder="イベントの様子を説明してください"></textarea>
                </div>
                <div class="event-modal-buttons">
                    <button type="button" class="event-modal-btn event-modal-btn-secondary" onclick="closeEventModal(this)">キャンセル</button>
                    <button type="submit" class="event-modal-btn event-modal-btn-primary">追加</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// モーダルを閉じる
function closeEventModal(element) {
    const modal = element.closest('.event-modal');
    modal.remove();
}

// イベントを保存
function saveEvent(e, imageData) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const title = formData.get('title');
    const date = formData.get('date');
    const description = formData.get('description') || 'イベントの様子';
    
    // 新しいイベントカードを作成
    const eventId = eventIdCounter++;
    const eventCard = document.createElement('div');
    eventCard.className = 'event-gallery-item';
    eventCard.setAttribute('data-event-id', eventId);
    eventCard.innerHTML = `
        <div class="event-gallery-image">
            <img src="${imageData}" alt="${title}">
        </div>
        <div class="event-gallery-info">
            <h4 class="event-gallery-title">${title}</h4>
            <p class="event-gallery-date">${date}</p>
            <p class="event-gallery-description">${description}</p>
            <button class="event-delete-btn" onclick="deleteEvent(${eventId})">削除</button>
        </div>
    `;
    
    // ギャラリーに追加（最初に追加）
    eventsGallery.insertBefore(eventCard, eventsGallery.firstChild);
    
    // アニメーション
    eventCard.style.opacity = '0';
    eventCard.style.transform = 'translateY(30px)';
    setTimeout(() => {
        eventCard.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        eventCard.style.opacity = '1';
        eventCard.style.transform = 'translateY(0)';
    }, 10);
    
    // モーダルを閉じる
    closeEventModal(e.target);
    
    // 成功メッセージ
    showEventSuccessMessage();
    
    // ローカルストレージに保存（オプション）
    saveEventToLocalStorage(eventId, title, date, description, imageData);
}

// イベントを削除
function deleteEvent(eventId) {
    if (confirm('このイベントを削除してもよろしいですか？')) {
        const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
        if (eventCard) {
            eventCard.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            eventCard.style.opacity = '0';
            eventCard.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                eventCard.remove();
            }, 300);
            
            // ローカルストレージから削除
            removeEventFromLocalStorage(eventId);
        }
    }
}

// イベント追加成功メッセージ
function showEventSuccessMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>イベントを追加しました！</h3>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 2000);
}

// ローカルストレージに保存
function saveEventToLocalStorage(id, title, date, description, imageData) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    events.push({ id, title, date, description, imageData });
    localStorage.setItem('events', JSON.stringify(events));
}

// ローカルストレージから削除
function removeEventFromLocalStorage(id) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const filteredEvents = events.filter(event => event.id !== id);
    localStorage.setItem('events', JSON.stringify(filteredEvents));
}

// ページ読み込み時に保存されたイベントを復元
window.addEventListener('load', () => {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-gallery-item';
        eventCard.setAttribute('data-event-id', event.id);
        eventCard.innerHTML = `
            <div class="event-gallery-image">
                <img src="${event.imageData}" alt="${event.title}">
            </div>
            <div class="event-gallery-info">
                <h4 class="event-gallery-title">${event.title}</h4>
                <p class="event-gallery-date">${event.date}</p>
                <p class="event-gallery-description">${event.description}</p>
                <button class="event-delete-btn" onclick="deleteEvent(${event.id})">削除</button>
            </div>
        `;
        eventsGallery.insertBefore(eventCard, eventsGallery.firstChild);
        
        // IDカウンターを更新
        if (event.id >= eventIdCounter) {
            eventIdCounter = event.id + 1;
        }
    });
});
