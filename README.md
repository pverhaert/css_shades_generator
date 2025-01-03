# CSS Shades Generator

## How to Use

1. **Select Base Color**:
   - Use the color picker to select your desired base color.
   - Click on the up-down arrows at the bottom of the color picker to toggle between RGB, HSL, and HEX color formats.

2. **Enter Color Name**:
   - Provide a name for your color in the "Color Name" input field. This name will be used as the prefix for the generated CSS custom properties.

3. **Generate Shades**:
   - The site will automatically generate various shades of the selected base color and display them in the preview section.

4. **Copy All Properties**:
   - Click the "Copy All Properties" button to copy all generated CSS custom properties to your clipboard.

5. **Use in CSS**:
   - Paste the copied properties into the `:root` selector of your CSS file to use them throughout your project.

## Example

```css
:root {
   --tm-primary-25: #feede9;
   --tm-primary-50: #fcdbd2;
   --tm-primary-100: #f9b7a6;
   --tm-primary-200: #f69379;
   --tm-primary-300: #f36f4d;
   --tm-primary-400: #f04b20;
   --tm-primary-500: #d8441d;
   --tm-primary-600: #c03c1a;
   --tm-primary-700: #a83516;
   --tm-primary-800: #902d13;
   --tm-primary-900: #782610;
   --tm-primary-950: #601e0d;
}