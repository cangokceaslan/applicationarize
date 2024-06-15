window.addEventListener('DOMContentLoaded', () => {
    // Add Font Awesome for icons
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    const searchContainer = document.createElement("div");
    searchContainer.style.position = "fixed";
    searchContainer.style.top = "10px";
    searchContainer.style.right = "10px";
    searchContainer.style.maxWidth = "400px";
    searchContainer.style.width = "100%";
    searchContainer.style.backgroundColor = "#333 !important";
    searchContainer.style.padding = "10px";
    searchContainer.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.5)";
    searchContainer.style.zIndex = "1000";
    searchContainer.style.display = "none";
    searchContainer.style.alignItems = "center";
    searchContainer.style.justifyContent = "space-between";
    searchContainer.style.boxSizing = "border-box";
    searchContainer.style.borderRadius = "5px";
    searchContainer.style.color = "#fff !important";
    searchContainer.style.gap = "10px";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Find in page";
    searchInput.style.flex = "1";
    searchInput.style.padding = "5px";
    searchInput.style.border = "1px solid #555 !important";
    searchInput.style.borderRadius = "3px";
    searchInput.style.backgroundColor = "#444 !important";
    searchInput.style.color = "#fff !important";
    searchContainer.appendChild(searchInput);

    const prevButton = document.createElement("button");
    prevButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    prevButton.style.padding = "5px 10px";
    prevButton.style.border = "none";
    prevButton.style.backgroundColor = "transparent !important";
    prevButton.style.color = "#fff !important";
    prevButton.style.borderRadius = "3px";
    prevButton.style.cursor = "pointer";
    searchContainer.appendChild(prevButton);

    const nextButton = document.createElement("button");
    nextButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    nextButton.style.padding = "5px 10px";
    nextButton.style.border = "none";
    nextButton.style.backgroundColor = "transparent";
    nextButton.style.color = "#fff !important";
    nextButton.style.borderRadius = "3px";
    nextButton.style.cursor = "pointer";
    searchContainer.appendChild(nextButton);

    document.body.appendChild(searchContainer);

    let currentIndex = -1;
    let highlights = [];

    function removeHighlights() {
        highlights.forEach((highlight) => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        highlights = [];
        currentIndex = -1;
    }

    function highlightText(node, text) {
        if (node.nodeType === 3) { // Text node
            const regex = new RegExp(`(${text})`, 'gi');
            const matches = node.data.match(regex);
            if (matches) {
                const span = document.createElement('span');
                span.className = 'highlight';
                span.innerHTML = node.data.replace(regex, '<mark>$1</mark>');
                node.parentNode.replaceChild(span, node);
                highlights.push(span);
            }
        } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT', 'STYLE'].includes(node.tagName)) {
            for (let i = 0; i < node.childNodes.length; i++) {
                highlightText(node.childNodes[i], text);
            }
        }
    }

    function highlight(text) {
        removeHighlights();

        if (!text) return;

        highlightText(document.body, text);

        if (highlights.length > 0) {
            currentIndex = 0;
            scrollToHighlight(currentIndex);
        }

        // Add highlight style
        const style = document.createElement('style');
        style.innerHTML = `
            .highlight mark {
                background-color: yellow;
                color: black;
                font-weight: bold;
            }
            .highlight.current mark {
                background-color: orange;
                color: black;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    function scrollToHighlight(index) {
        if (highlights[index]) {
            highlights[index].scrollIntoView({ behavior: "smooth", block: "center" });
            highlights.forEach((highlight, i) => {
                if (i === index) {
                    highlight.classList.add('current');
                } else {
                    highlight.classList.remove('current');
                }
            });
        }
    }

    function executeSearch() {
        const searchText = searchInput.value;
        highlight(searchText);
        if (highlights.length > 0) {
            currentIndex = 0;
            scrollToHighlight(currentIndex);
        }
    }

    nextButton.addEventListener("click", () => {
        if (highlights.length > 0) {
            currentIndex = (currentIndex + 1) % highlights.length;
            scrollToHighlight(currentIndex);
        }
    });

    prevButton.addEventListener("click", () => {
        if (highlights.length > 0) {
            currentIndex = (currentIndex - 1 + highlights.length) % highlights.length;
            scrollToHighlight(currentIndex);
        }
    });

    searchInput.addEventListener("input", function () {
        executeSearch();
    });

    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                prevButton.click();
            } else {
                nextButton.click();
            }
        }
    });

    document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "f") {
            e.preventDefault();
            searchInput.value = '';
            searchContainer.style.display = "flex";
            searchInput.focus();
        } else if (e.key === "Escape") {
            searchContainer.style.display = "none";
            removeHighlights();
            searchInput.value = '';
        }
    });
});