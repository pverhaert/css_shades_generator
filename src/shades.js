import './style.css';
import Swal from 'sweetalert2';

const hexToRGB = hex => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
];

const RGBToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = Math.min(255, Math.max(0, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');

const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastColor = (r, g, b) => getLuminance(r, g, b) > 0.5 ? '#000000' : '#FFFFFF';

const adjustShade = (rgb, factor) => factor < 1
    ? rgb.map(channel => channel + (255 - channel) * (1 - factor))
    : rgb.map(channel => Math.max(0, Math.min(255, channel * (1 - (factor - 1) * 0.5))));

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
            html: 'Paste them in the <code style="color: darkred">:root</code> selector of your CSS file.',
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

const generateShades = () => {
    const baseColor = document.getElementById('colorPicker').value;
    const colorName = document.getElementById('colorName').value.toLowerCase();
    const sanitizedName = colorName.replace(/[^a-z0-9-]/g, '-');

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

    // Set body background to shade 25
    document.body.style.backgroundColor = RGBToHex(...shades[25]);

    let cssOutput = '';
    let previewHTML = '';

    Object.entries(shades).forEach(([shade, rgb]) => {
        const hexColor = RGBToHex(...rgb);
        const textColor = getContrastColor(...rgb);
        const property = `--${sanitizedName}-${shade}: ${hexColor};`;
        cssOutput += property + '\n';

        previewHTML += `
            <div class="w-24 h-24 rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all" 
                 style="background-color: ${hexColor}; color: ${textColor}"
                 onclick="copyToClipboard('${property}')">
                <span class="font-medium">${shade}</span>
                <span class="text-sm">${hexColor}</span>
            </div>
        `;
    });

    document.getElementById('cssOutput').textContent = cssOutput.trim();
    document.getElementById('colorPreview').innerHTML = previewHTML;

    // Set copy button background to shade 900
    const copyAllBtn = document.getElementById('copyAllBtn');
    copyAllBtn.style.backgroundColor = RGBToHex(...shades[900]);
    copyAllBtn.style.color = getContrastColor(...shades[900]);

    // Update favicon
    updateFavicon(baseColor);
};

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.getElementById('colorPicker');
    const colorName = document.getElementById('colorName');
    const copyAllBtn = document.getElementById('copyAllBtn');

    colorPicker.addEventListener('input', generateShades);
    colorName.addEventListener('input', generateShades);
    copyAllBtn.addEventListener('click', copyAllProperties);

    // Generate initial shades
    generateShades();
});