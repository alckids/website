(() => {
    'use strict';

    // ==========================================
    // DOMキャッシュ用オブジェクト
    // ==========================================
    const el = {};

    // ==========================================
    // 設定値の定数化
    // ==========================================
    const CONFIG = {
        SCROLL_THRESHOLD: 50,     // ヘッダーのスタイルが変わるスクロール量
        THROTTLE_WAIT: 100,       // スクロールイベントの間引き時間(ms)
        HEADER_OFFSET_ADJUST: -50  // スムーススクロール時の余白微調整
    };

    // ==========================================
    // 初期化処理
    // ==========================================
    function init() {
        cacheDom();
        bindEvents();
    }

    function cacheDom() {
        el.header = document.getElementById('header');
        el.drawerBtn = document.querySelector('.l-header__drawer-btn');
        el.nav = document.getElementById('globalNav');
        el.scrollLinks = document.querySelectorAll('a[href^="#"]');
        el.trialForm = document.getElementById('trialForm');
    }

    function bindEvents() {
        setupDrawer();
        setupSmoothScroll();
        setupHeaderScroll();
        setupForm();
    }

    // ==========================================
    // 機能ごとのセットアップ
    // ==========================================

    /**
     * スマホ用ドロワーメニューの開閉制御
     */
    function setupDrawer() {
        if (!el.drawerBtn || !el.nav) return;

        el.drawerBtn.addEventListener('click', () => {
            const isExpanded = el.drawerBtn.getAttribute('aria-expanded') === 'true';
            
            if (!isExpanded) {
                el.drawerBtn.setAttribute('aria-expanded', 'true');
                el.drawerBtn.classList.add('is-active');
                el.nav.classList.add('is-open');
                document.body.style.overflow = 'hidden'; // 背面のスクロール防止
            } else {
                closeDrawer();
            }
        });
    }

    function closeDrawer() {
        if (!el.drawerBtn || !el.nav) return;
        el.drawerBtn.setAttribute('aria-expanded', 'false');
        el.drawerBtn.classList.remove('is-active');
        el.nav.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    /**
     * スムーススクロール制御
     */
    function setupSmoothScroll() {
        if (!el.scrollLinks.length) return;

        el.scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#' || targetId === '') return;

                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();

                const headerHeight = el.header ? el.header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;

                window.scrollTo({
                    top: targetPosition - headerHeight - CONFIG.HEADER_OFFSET_ADJUST,
                    behavior: 'smooth'
                });

                closeDrawer();
            });
        });
    }

    /**
     * スクロール時のヘッダー制御 (Throttle適用)
     */
    function setupHeaderScroll() {
        if (!el.header) return;

        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
                el.header.classList.add('is-scrolled');
            } else {
                el.header.classList.remove('is-scrolled');
            }
        }, CONFIG.THROTTLE_WAIT));
    }

    /**
     * フォーム送信制御
     */
    function setupForm() {
        if (!el.trialForm) return;

        el.trialForm.addEventListener('submit', (e) => {
            e.preventDefault(); // デフォルトの送信をストップ

            // ★ここに先ほどコピーしたGASの「ウェブアプリのURL」を貼り付けます
            const gasUrl = 'https://script.google.com/macros/s/AKfycbwRGbRDxxBe-s6qjB1Rspw_yAkYkmhX5VrnMfjOqwh3cAdjkn0M-U49z4ZRFZWlHKlc/exec';

            // 送信ボタンを連打できないように「送信中」にする
            const submitBtn = el.trialForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            // フォームのデータをまとめる
            const formData = new FormData(el.trialForm);
            // GASが受け取りやすい形式に変換
            const data = new URLSearchParams();
            for (const pair of formData) {
                data.append(pair[0], pair[1]);
            }

            // GASへデータを送信
            fetch(gasUrl, {
                method: 'POST',
                body: data,
            })
            .then(response => {
                // 送信成功時
                alert('無料体験レッスンのお申し込みを受け付けました。\n担当者より3営業日以内にご連絡させていただきます。');
                el.trialForm.reset(); // フォームを空にする
            })
            .catch(error => {
                // 送信失敗時
                console.error('Error:', error);
                alert('通信エラーが発生しました。時間をおいて再度お試しいただくか、直接メールでお問い合わせください。');
            })
            .finally(() => {
                // ボタンを元の状態に戻す
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    // ==========================================
    // ユーティリティ関数
    // ==========================================

    /**
     * 間引き処理（Throttle）
     */
    function throttle(fn, wait) {
        let isThrottled = false;
        return function(...args) {
            if (!isThrottled) {
                fn.apply(this, args);
                isThrottled = true;
                setTimeout(() => {
                    isThrottled = false;
                }, wait);
            }
        };
    }

    // ==========================================
    // 実行（DOM構築完了後）
    // ==========================================
    document.addEventListener('DOMContentLoaded', init);

})();