// GitHub API Integration dengan debugging
const githubUsername = 'kamilhasani';

async function loadGitHubRepos() {
    console.log('Memulai load GitHub repos...');
    const loadingElement = document.getElementById('portfolioLoading');
    const gridElement = document.getElementById('portfolioGrid');
    const errorElement = document.getElementById('portfolioError');
    const githubLink = document.getElementById('githubProfileLink');

    try {
        // Show loading, hide others
        loadingElement.style.display = 'block';
        gridElement.style.display = 'none';
        errorElement.style.display = 'none';

        console.log('Fetching data untuk user:', githubUsername);
        
        // Fetch user data and repos
        const userUrl = `https://api.github.com/users/${githubUsername}`;
        const reposUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=9&page=1`;
        
        console.log('URL User:', userUrl);
        console.log('URL Repos:', reposUrl);

        const [userResponse, reposResponse] = await Promise.all([
            fetch(userUrl),
            fetch(reposUrl)
        ]);

        console.log('User Response Status:', userResponse.status);
        console.log('Repos Response Status:', reposResponse.status);

        if (!userResponse.ok) {
            throw new Error(`User API Error: ${userResponse.status} ${userResponse.statusText}`);
        }

        if (!reposResponse.ok) {
            throw new Error(`Repos API Error: ${reposResponse.status} ${reposResponse.statusText}`);
        }

        const userData = await userResponse.json();
        const repos = await reposResponse.json();

        console.log('User Data:', userData);
        console.log('Repos Data:', repos);

        // Update repo count
        document.getElementById('repoCount').textContent = userData.public_repos;

        // Update GitHub profile link
        githubLink.href = userData.html_url;
        githubLink.style.display = 'block';
        githubLink.textContent = `Lihat Semua Proyek di GitHub (${userData.public_repos})`;

        // Display repositories
        displayRepositories(repos);

        // Hide loading, show grid
        loadingElement.style.display = 'none';
        gridElement.style.display = 'flex';

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        
        let errorMessage = 'Terjadi kesalahan saat memuat data GitHub';
        
        if (error.message.includes('404')) {
            errorMessage = 'Username GitHub tidak ditemukan. Pastikan username benar!';
        } else if (error.message.includes('403')) {
            errorMessage = 'Rate limit exceeded. Silakan coba lagi dalam 1 jam atau gunakan GitHub Token.';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = 'Koneksi internet bermasalah. Periksa koneksi Anda.';
        }
        
        document.getElementById('errorMessage').textContent = errorMessage;
    }
}

function displayRepositories(repos) {
    const gridElement = document.getElementById('portfolioGrid');
    
    if (!repos || repos.length === 0) {
        gridElement.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Tidak ada repository publik yang ditemukan untuk user ini.
                </div>
            </div>
        `;
        return;
    }

    const reposHTML = repos.map(repo => {
        // Format description - maksimal 120 karakter
        const description = repo.description 
            ? (repo.description.length > 120 
                ? repo.description.substring(0, 120) + '...' 
                : repo.description)
            : 'Tidak ada deskripsi';
        
        // Format date
        const updatedDate = new Date(repo.updated_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card portfolio-card h-100">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title text-truncate" title="${repo.name}">${repo.name}</h5>
                        <span class="badge bg-secondary">${repo.language || 'Text'}</span>
                    </div>
                    
                    <p class="card-text flex-grow-1" style="font-size: 0.9rem;">${description}</p>
                    
                    <div class="repo-stats mt-auto">
                        <div class="d-flex justify-content-between align-items-center text-muted small">
                            <div>
                                <i class="bi bi-star me-1"></i>${repo.stargazers_count}
                            </div>
                            <div>
                                <i class="bi bi-diagram-2 me-1"></i>${repo.forks_count}
                            </div>
                            <div>
                                <i class="bi bi-circle-fill me-1" style="color: ${getLanguageColor(repo.language)}"></i>
                                ${repo.language || 'Unknown'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <div class="d-grid gap-2">
                            <a href="${repo.html_url}" target="_blank" class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-github me-1"></i>Lihat Code
                            </a>
                            ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="btn btn-outline-success btn-sm">
                                <i class="bi bi-eye me-1"></i>Live Demo
                            </a>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="mt-2 text-center">
                        <small class="text-muted">
                            <i class="bi bi-clock me-1"></i>Updated: ${updatedDate}
                        </small>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    gridElement.innerHTML = reposHTML;
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'CSS': '#563d7c',
        'HTML': '#e34c26',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'C++': '#f34b7d',
        'C#': '#178600',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Vue': '#2c3e50',
        'React': '#61dafb',
        'Shell': '#89e051',
        'Dart': '#00B4AB',
        'Kotlin': '#F18E33'
    };
    return colors[language] || '#6c757d';
}

// Initialize dengan error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Theme functionality
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        let currentTheme = localStorage.getItem('theme') || 'light';
        
        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            
            if (theme === 'dark') {
                themeIcon.className = 'bi bi-sun';
                themeToggle.classList.remove('btn-outline-light');
                themeToggle.classList.add('btn-light');
            } else {
                themeIcon.className = 'bi bi-moon';
                themeToggle.classList.remove('btn-light');
                themeToggle.classList.add('btn-outline-light');
            }
        }
        
        applyTheme(currentTheme);
        
        themeToggle.addEventListener('click', function() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);
        });
    }

    // Load GitHub repositories
    if (githubUsername && githubUsername !== 'YOUR_GITHUB_USERNAME') {
        console.log('Memuat repos untuk:', githubUsername);
        loadGitHubRepos();
    } else {
        console.error('Username GitHub belum diatur!');
        document.getElementById('portfolioLoading').style.display = 'none';
        document.getElementById('portfolioError').style.display = 'block';
        document.getElementById('errorMessage').textContent = 
            'Username GitHub belum dikonfigurasi. Silakan ganti "YOUR_GITHUB_USERNAME" dengan username GitHub Anda.';
    }
});

// Manual refresh function
function refreshGitHubData() {
    console.log('Manual refresh dipanggil');
    loadGitHubRepos();
}

// Smooth scroll function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Download CV function
function downloadCV() {
    // Create a temporary link for download
    const link = document.createElement('a');
    link.href = 'cv.pdf'; // Ganti dengan path file CV Anda
    link.download = 'CV-[Nama-Anda].pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Optional: Show success message
    alert('CV berhasil diunduh!');
}

// Contact form handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // Here you would typically send the data to a server
    console.log('Form data:', formData);
    
    // Show success message
    alert('Pesan berhasil dikirim! Saya akan membalas segera.');
    
    // Reset form
    this.reset();
});

// Add scroll animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});