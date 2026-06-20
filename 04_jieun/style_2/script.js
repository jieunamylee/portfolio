// 60fps 성능을 위한 Intersection Observer 적용 (스크롤 이벤트 최소화)
document.addEventListener('DOMContentLoaded', () => {
    // 1. 스크롤 페이드업 애니메이션 (시각적 임팩트 우선)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // 15% 정도 보일 때 애니메이션 시작
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 부드러운 등장을 위해 visible 클래스 추가
                entry.target.classList.add('visible');
                // 성능 최적화: 한 번 나타난 요소는 더 이상 관찰하지 않음
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // 애니메이션을 적용할 요소들 선택
    const animateElements = document.querySelectorAll('.intro-banner, .bento-box, .archive-item, .section-title, .case-header');
    animateElements.forEach(el => {
        el.classList.add('fade-up-element');
        observer.observe(el);
    });

    // 2. 모바일 터치 대응 및 부드러운 스크롤 네비게이션
    const navLinks = document.querySelectorAll('.nav-link');
    
    const smoothScroll = (e) => {
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };

    navLinks.forEach(link => {
        // 규칙 4: 마우스 이벤트가 있으면 터치 이벤트도 추가
        link.addEventListener('click', smoothScroll);
        link.addEventListener('touchstart', smoothScroll, { passive: true });
    });

    // 3. 다크 모드 / 라이트 모드 테마 토글 로직
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // 로컬 스토리지에서 기존 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 토글 버튼 클릭 이벤트
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // 4. Hero 무중력 파티클 애니메이션 (60fps 성능 최적화)
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const particleCount = 800;
        
        // 사이즈 추가 축소
        const sizes = [0.4, 0.8, 1.2, 1.6, 2.0];
        const colors = ['#FF5722', '#FF7043', '#FF8A65']; 

        // 마우스 및 터치 인터랙션을 위한 좌표 추적
        let mouse = { x: null, y: null };
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // 모바일 터치 대응 (규칙 준수)
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });
        window.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // 브라우저 리사이징 및 고해상도(Retina) 디스플레이 대응
        let resizeTimeout;
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            
            // 캔버스 해상도를 기기 픽셀 비율에 맞게 조절하여 찌그러짐 방지
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            
            // 리사이징 시 파티클이 한곳에 뭉치지 않고 넓어진 화면에 고르게 재배치되도록 처리
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initParticles, 150);
        };
        
        window.addEventListener('resize', resize);

        const textElements = document.querySelectorAll('.motion-text');
        const heroSection = document.querySelector('.hero');

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = sizes[Math.floor(Math.random() * sizes.length)];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                
                // 무중력 상태처럼 매우 느리고 랜덤한 방향 (속도 조절)
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                
                // 은은하게 보이기 위한 투명도 랜덤
                this.alpha = Math.random() * 0.5 + 0.15; 
            }

            update(textRects) {
                this.x += this.vx;
                this.y += this.vy;

                // 타이포그래피 충돌 처리 (Bounding Box Collision)
                if (textRects) {
                    for (let rect of textRects) {
                        const padding = 5; // 글자 여백
                        if (this.x + this.size > rect.left - padding && 
                            this.x - this.size < rect.right + padding &&
                            this.y + this.size > rect.top - padding && 
                            this.y - this.size < rect.bottom + padding) {
                            
                            let overlapLeft = (this.x + this.size) - (rect.left - padding);
                            let overlapRight = (rect.right + padding) - (this.x - this.size);
                            let overlapTop = (this.y + this.size) - (rect.top - padding);
                            let overlapBottom = (rect.bottom + padding) - (this.y - this.size);
                            
                            let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                            
                            // 충돌 시 튕겨냄
                            if (minOverlap === overlapLeft) { this.x -= overlapLeft; this.vx *= -1; }
                            else if (minOverlap === overlapRight) { this.x += overlapRight; this.vx *= -1; }
                            else if (minOverlap === overlapTop) { this.y -= overlapTop; this.vy *= -1; }
                            else if (minOverlap === overlapBottom) { this.y += overlapBottom; this.vy *= -1; }
                        }
                    }
                }

                // 마우스 인터랙션 (파티클이 마우스를 피하는 모션 - 반경 조절)
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let maxDistance = 150; // 피하는 반경 축소 (250 -> 150)

                    if (distance < maxDistance) {
                        let forceDirectionX = dx / distance;
                        let forceDirectionY = dy / distance;
                        let force = (maxDistance - distance) / maxDistance;
                        
                        let weight = 1 / this.size; 
                        
                        // 더 강하게 튕겨나가도록 힘 증가
                        this.x -= forceDirectionX * force * weight * 20;
                        this.y -= forceDirectionY * force * weight * 20;
                    }
                }

                // 화면 밖으로 나가면 반대쪽에서 나타나게 하여 무한히 떠도는 느낌 부여
                if (this.x < -this.size) this.x = width + this.size;
                if (this.x > width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = height + this.size;
                if (this.y > height + this.size) this.y = -this.size;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        // 파티클 초기화 함수
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        // 최초 실행
        resize();
        initParticles();

        // 60fps 애니메이션 루프
        function animate() {
            ctx.clearRect(0, 0, width, height);

            // 텍스트 위치 추적 (CSS 애니메이션으로 인해 매 프레임 업데이트)
            let textRects = [];
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                textRects = Array.from(textElements).map(el => {
                    const rect = el.getBoundingClientRect();
                    return {
                        left: rect.left - heroRect.left,
                        right: rect.right - heroRect.left,
                        top: rect.top - heroRect.top,
                        bottom: rect.bottom - heroRect.top
                    };
                });
            }

            particles.forEach(p => {
                p.update(textRects);
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        
        animate();
    }
});
