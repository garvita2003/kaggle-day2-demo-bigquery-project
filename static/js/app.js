document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const notesContainer = document.getElementById('notes-container');
    const errorBanner = document.getElementById('error-banner');
    
    // Tweet Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelTweetBtn = document.getElementById('cancel-tweet');
    const submitTweetBtn = document.getElementById('submit-tweet');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCount = document.getElementById('char-count');
    const charCountContainer = charCount.parentElement;
    const modalNoteTitle = document.getElementById('modal-note-title');

    let currentSelectedNote = null;

    // Load initial release notes
    fetchNotes();

    // Event Listeners
    refreshBtn.addEventListener('click', fetchNotes);
    
    // Close Modal Events
    closeModalBtn.addEventListener('click', hideTweetModal);
    cancelTweetBtn.addEventListener('click', hideTweetModal);
    document.querySelector('.modal-backdrop').addEventListener('click', hideTweetModal);

    // Textarea word counter & constraint checking
    tweetTextarea.addEventListener('input', () => {
        const length = tweetTextarea.value.length;
        charCount.textContent = length;
        
        if (length > 280) {
            charCountContainer.className = 'char-count-container over-limit';
            submitTweetBtn.disabled = true;
        } else if (length > 250) {
            charCountContainer.className = 'char-count-container near-limit';
            submitTweetBtn.disabled = false;
        } else {
            charCountContainer.className = 'char-count-container';
            submitTweetBtn.disabled = false;
        }
    });

    submitTweetBtn.addEventListener('click', () => {
        const tweetText = tweetTextarea.value;
        // Web Intent URL for Twitter/X
        const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterIntentUrl, '_blank', 'width=550,height=420');
        hideTweetModal();
    });

    // Fetch notes from Flask backend
    async function fetchNotes() {
        showLoadingState();
        errorBanner.classList.add('hidden');

        try {
            const response = await fetch('/api/notes');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.success) {
                renderNotes(data.notes);
            } else {
                throw new Error(data.error || 'Failed to fetch release notes');
            }
        } catch (error) {
            console.error('Error fetching release notes:', error);
            errorBanner.classList.remove('hidden');
            notesContainer.innerHTML = `<div class="error-state" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>Unable to retrieve release notes right now.</p>
                <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="location.reload()">Reload Page</button>
            </div>`;
        } finally {
            hideLoadingState();
        }
    }

    function showLoadingState() {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
        
        // Show skeleton cards if container is empty or has old elements
        notesContainer.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    }

    function hideLoadingState() {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }

    // Render release note card elements
    function renderNotes(notes) {
        if (!notes || notes.length === 0) {
            notesContainer.innerHTML = '<div class="no-notes">No release notes found.</div>';
            return;
        }

        notesContainer.innerHTML = '';
        notes.forEach(note => {
            const card = document.createElement('article');
            card.className = 'note-card';

            // Extract display elements
            const pubDate = new Date(note.published);
            const formattedDate = pubDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Parse entry summary to extract first sentences/text for pre-populating tweet
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = note.content_html;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const shortSummary = textContent.slice(0, 180).trim() + (textContent.length > 180 ? '...' : '');

            card.innerHTML = `
                <div class="note-header">
                    <span class="note-date">${formattedDate}</span>
                </div>
                <h3 class="note-title">${escapeHTML(note.title)}</h3>
                <div class="note-body">${note.content_html}</div>
                <div class="note-actions">
                    <a href="${note.link}" target="_blank" class="source-link" rel="noopener noreferrer">
                        View Official Source &rarr;
                    </a>
                    <button class="btn btn-twitter tweet-btn">
                        <svg class="twitter-icon" viewBox="0 0 24 24" width="16" height="16" style="margin-bottom: -2px;">
                            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                        Tweet Note
                    </button>
                </div>
            `;

            // Attach event listener for individual card's tweet action
            const tweetBtn = card.querySelector('.tweet-btn');
            tweetBtn.addEventListener('click', () => {
                showTweetModal(note, shortSummary);
            });

            notesContainer.appendChild(card);
        });
    }

    function showTweetModal(note, shortSummary) {
        currentSelectedNote = note;
        modalNoteTitle.textContent = note.title;

        // Auto compose a clean, informative tweet
        const hashtags = "#BigQuery #GoogleCloud #DataEngineering";
        const link = note.link !== "#" ? note.link : "https://cloud.google.com/bigquery";
        
        // Structure: "Title - Brief description... Link hashtags"
        // Let's create an optimized tweet text draft:
        const baseTweet = `📢 BigQuery Update: ${note.title}\n\n"${shortSummary}"\n\nRead more: ${link}\n${hashtags}`;
        
        tweetTextarea.value = baseTweet.slice(0, 280);
        tweetTextarea.dispatchEvent(new Event('input')); // trigger character count update
        
        tweetModal.classList.remove('hidden');
        tweetTextarea.focus();
    }

    function hideTweetModal() {
        tweetModal.classList.add('hidden');
        currentSelectedNote = null;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
