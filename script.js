// ===== GitHub Projects Loader =====
const GITHUB_USER = 'HE-MAESTRO';

const langColors = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'null': '#888'
};

async function loadProjects() {
    const grid = document.getElementById('projects-grid');

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=20`);
        const repos = await res.json();

        // Filter out profile repo
        const projects = repos.filter(r => r.name !== GITHUB_USER && !r.fork);

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="glass-card" style="text-align:center; grid-column: 1/-1; opacity:0.5;">
                    <p>Проекты скоро появятся...</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = projects.map(repo => `
            <a href="${repo.html_url}" target="_blank" class="glass-card project-card fade-in">
                <div class="project-name">
                    <i class="mdi mdi-folder-outline"></i> ${repo.name}
                </div>
                <div class="project-desc">${repo.description || 'Без описания'}</div>
                <div class="project-meta">
                    ${repo.language ? `
                        <div class="project-lang">
                            <span class="lang-dot" style="background:${langColors[repo.language] || '#888'}"></span>
                            ${repo.language}
                        </div>
                    ` : ''}
                    <div>
                        <i class="mdi mdi-star-outline"></i> ${repo.stargazers_count}
                    </div>
                    <div>
                        <i class="mdi mdi-source-fork"></i> ${repo.forks_count}
                    </div>
                </div>
            </a>
        `).join('');

        // Trigger fade-in after render
        requestAnimationFrame(() => {
            document.querySelectorAll('.project-card.fade-in').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 150);
            });
        });

    } catch (err) {
        grid.innerHTML = `
            <div class="glass-card" style="text-align:center; grid-column: 1/-1;">
                <p><i class="mdi mdi-alert-circle-outline"></i> Не удалось загрузить проекты</p>
            </div>
        `;
    }
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    // Add fade-in class to elements
    document.querySelectorAll('.glass-card, .tech-item, h2').forEach(el => {
        if (!el.classList.contains('fade-in')) {
            el.classList.add('fade-in');
        }
        observer.observe(el);
    });
}

// ===== Particles =====
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = (50 + Math.random() * 50) + '%';
        particle.style.animationDelay = Math.random() * 4 + 's';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    initScrollAnimations();
    initParticles();
});
