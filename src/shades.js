import './style.css';
import Swal from 'sweetalert2';

// Color conversion utilities
const hexToRGB = hex => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
];

const RGBToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = Math.min(255, Math.max(0, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');

// Color analysis utilities
const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastColor = (r, g, b) => getLuminance(r, g, b) > 0.5 ? '#000000' : '#FFFFFF';

// Shade adjustment utility
const adjustShade = (rgb, factor) => factor < 1
    ? rgb.map(channel => channel + (255 - channel) * (1 - factor))
    : rgb.map(channel => Math.max(0, Math.min(255, channel * (1 - (factor - 1) * 0.5))));

// Clipboard functionality
const copyToClipboard = async text => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }
};

// UI utilities
const updateFavicon = (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, 2 * Math.PI);
    ctx.fill();

    const favicon = document.getElementById('favicon');
    favicon.href = canvas.toDataURL('image/x-icon');
};

const copyAllProperties = () => {
    const properties = document.getElementById('cssOutput').textContent;
    copyToClipboard(properties).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied CSS Properties',
            html: 'Paste them directly into your CSS file.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            background: '#e1fce9',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    });
};

const copyTailwindProperties = () => {
    const properties = document.getElementById('tailwindOutput').textContent;
    copyToClipboard(properties).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied Tailwind Colors',
            html: 'Paste them in your CSS file to use with Tailwind.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            background: '#e1fce9',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    });
};

// Main functionality
const generateShades = () => {
    let allCssOutput = ':root {\n';
    let allTailwindOutput = '@theme {\n';
    let allPreviewHTML = '';
    let firstColorLight;

    // Process each color input
    for (let i = 1; i <= 4; i++) {
        const baseColor = document.getElementById(`colorPicker${i}`).value;
        const colorName = document.getElementById(`colorName${i}`).value.toLowerCase();
        const sanitizedName = colorName.replace(/[^a-z0-9-]/g, '-');

        if (i === 1) {
            updateFavicon(baseColor);
        }

        const rgb = hexToRGB(baseColor);
        const shades = {
            25: adjustShade(rgb, 0.1),
            50: adjustShade(rgb, 0.2),
            100: adjustShade(rgb, 0.4),
            200: adjustShade(rgb, 0.6),
            300: adjustShade(rgb, 0.8),
            400: rgb,
            500: adjustShade(rgb, 1.2),
            600: adjustShade(rgb, 1.4),
            700: adjustShade(rgb, 1.6),
            800: adjustShade(rgb, 1.8),
            900: adjustShade(rgb, 2.0),
            950: adjustShade(rgb, 2.2)
        };

        if (i === 1) {
            firstColorLight = RGBToHex(...shades[25]);
            document.body.style.backgroundColor = firstColorLight;
        }

        allCssOutput += `  /* ${sanitizedName} colors */\n`;
        allTailwindOutput += `  /* ${sanitizedName} colors */\n`;
        let colorPreviewHTML = `<div class="space-y-2">
                    <h3 class="font-semibold text-gray-800">${sanitizedName}</h3>
                    <div class="grid grid-cols-3 gap-2">`;

        Object.entries(shades).forEach(([shade, rgb]) => {
            const hexColor = RGBToHex(...rgb);
            const textColor = getContrastColor(...rgb);
            const cssProperty = `--${sanitizedName}-${shade}: ${hexColor};`;
            const tailwindProperty = `  --color-${sanitizedName}-${shade}: ${hexColor};`;
            
            allCssOutput += '  ' + cssProperty + '\n';
            allTailwindOutput += tailwindProperty + '\n';

            colorPreviewHTML += `
                        <div class="aspect-square rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all text-xs"
                            style="background-color: ${hexColor}; color: ${textColor}"
                            onclick="copyToClipboard('${cssProperty}')">
                            <span class="font-medium">${shade}</span>
                            <span>${hexColor}</span>
                        </div>`;
        });

        allCssOutput += '\n';
        allTailwindOutput += '\n';
        colorPreviewHTML += '</div></div>';
        allPreviewHTML += colorPreviewHTML;
    }

    allTailwindOutput += '}';
    allCssOutput += '}';
    
    document.getElementById('cssOutput').textContent = allCssOutput.trim();
    document.getElementById('tailwindOutput').textContent = allTailwindOutput.trim();
    document.getElementById('colorPreview').innerHTML = allPreviewHTML;
};

// Tab switching functionality
const switchTab = (tabId) => {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.remove('hidden');
    
    // Reset all tab buttons
    document.querySelectorAll('#cssTabBtn, #tailwindTabBtn').forEach(btn => {
        btn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
        btn.classList.add('text-gray-600', 'hover:text-blue-600');
    });
    
    // Highlight the active tab button
    const activeBtn = tabId === 'cssTabContent' ? 'cssTabBtn' : 'tailwindTabBtn';
    document.getElementById(activeBtn).classList.remove('text-gray-600', 'hover:text-blue-600');
    document.getElementById(activeBtn).classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`colorPicker${i}`).addEventListener('input', generateShades);
        document.getElementById(`colorName${i}`).addEventListener('input', generateShades);
    }

    document.getElementById('copyAllBtn').addEventListener('click', copyAllProperties);
    document.getElementById('copyTailwindBtn').addEventListener('click', copyTailwindProperties);
    
    // Tab switching event listeners
    document.getElementById('cssTabBtn').addEventListener('click', () => switchTab('cssTabContent'));
    document.getElementById('tailwindTabBtn').addEventListener('click', () => switchTab('tailwindTabContent'));
    
    generateShades();
});