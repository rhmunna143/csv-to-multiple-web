# CSV to Multi-Website Generator

A powerful Node.js build tool that reads data from CSV files and generates multiple standalone React websites with dynamic content replacement and randomized text variations.

## 🚀 Features

- **CSV-Driven Generation**: Generate multiple websites from a single CSV file
- **Dynamic Content**: Replace template variables with CSV data
- **Random Text Selection**: Randomize content variations for unique websites
- **React + Tailwind**: Modern React applications with Tailwind CSS styling
- **Form Integration**: Contact forms with React Hook Form
- **State Management**: Zustand for client-side state
- **Parallel Building**: Build multiple sites concurrently
- **Production Ready**: Optimized builds with webpack

## 📁 Project Structure

```
csv-to-web/
├── src/
│   ├── template/           # React template application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Hero.jsx
│   │   │   │   └── Contact.jsx
│   │   │   ├── stores/
│   │   │   │   └── websiteStore.js
│   │   │   ├── App.js
│   │   │   ├── index.js
│   │   │   └── index.css
│   │   ├── public/
│   │   │   └── index.html
│   │   └── package.json
│   ├── generator/          # Build script logic
│   │   ├── index.js        # Main generator
│   │   ├── csvParser.js    # CSV processing
│   │   ├── templateProcessor.js # Template replacement
│   │   ├── websiteBuilder.js    # Website building
│   │   ├── csvValidator.js      # CSV validation
│   │   └── singleBuilder.js     # Single site builder
│   └── data/
│       └── websites.csv    # Source data
├── build/                  # Generated websites
├── package.json
├── .env                   # Configuration
└── README.md
```

## 🛠️ Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   Edit `.env` file to customize paths:
   ```env
   CSV_PATH=./src/data/websites.csv
   TEMPLATE_PATH=./src/template
   BUILD_PATH=./build
   PARALLEL_BUILDS=3
   NODE_ENV=production
   ```

## 📊 CSV Data Format

Create your website data in `src/data/websites.csv`:

```csv
domain,title,description,phone,address
foodexpress.com,Food Express,Delicious meals delivered fast,01712345678,"House 12, Road 5, Banani, Dhaka"
techhubbd.com,Tech Hub BD,Your trusted tech partner,01898765432,"Level 4, Block B, Dhanmondi, Dhaka"
bookbazaar.com,Book Bazaar,Buy and sell books online,01911223344,"Shop 22, New Market, Chittagong"
```

### Required Fields
- `domain`: Website domain name
- `title`: Website title
- `description`: Website description
- `phone`: Contact phone number
- `address`: Physical address

## 🎯 Template Syntax

### Dynamic Variables
Replace with CSV data:
```jsx
{{ domain }}     // Website domain
{{ title }}      // Website title  
{{ description }} // Website description
{{ phone }}      // Contact phone
{{ address }}    // Physical address
```

### Random Text Selection
Randomly select from options:
```jsx
[[ Quick | Fast | Speedy ]] delivery
[[ Contact Us | Call Now | Get Quote ]]
```

### Example Template Usage
```jsx
// In Hero component
<h1>
  [[ Quick | Fast | Speedy ]] delivery service for {{ title }}
</h1>
<p>{{ description }}</p>

// In Contact component  
<p>Phone: {{ phone }}</p>
<p>Address: {{ address }}</p>
```

## 🚀 Usage

### Generate All Websites
```bash
npm start
```
This will:
1. Parse the CSV file
2. Clean the build directory
3. Generate all websites in parallel
4. Create a build summary

### Validate CSV File
```bash
npm run validate
```
Check CSV format and required fields without building.

### Build Single Website
```bash
npm run build:single -- --domain=foodexpress.com
```
Build only a specific domain from the CSV.

### Development Mode
```bash
npm run dev
```
Watch for changes and rebuild automatically.

### Clean Build Directory
```bash
npm run clean
```
Remove all generated websites.

## 📂 Output Structure

After running `npm start`, you'll get:

```
build/
├── foodexpress.com/
│   ├── build/              # Production React build
│   ├── src/               # Processed source files
│   ├── package.json       # Updated package.json
│   └── node_modules/      # Dependencies
├── techhubbd.com/
├── bookbazaar.com/
└── build-summary.md       # Generation report
```

## 🎨 Customizing the Template

### Adding Components
1. Create new components in `src/template/src/components/`
2. Use template syntax for dynamic content
3. Import and use in `App.js`

### Styling
- Modify Tailwind classes in components
- Update `tailwind.config.js` for theme customization
- Add custom CSS in `src/template/src/index.css`

### State Management
- Update `src/template/src/stores/websiteStore.js`
- Add new state properties
- Use in components with `useWebsiteStore()`

## 🔧 Advanced Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CSV_PATH` | `./src/data/websites.csv` | Path to CSV file |
| `TEMPLATE_PATH` | `./src/template` | Template directory |
| `BUILD_PATH` | `./build` | Output directory |
| `PARALLEL_BUILDS` | `3` | Concurrent builds |
| `NODE_ENV` | `production` | Environment mode |

### Custom Build Process

Modify `src/generator/websiteBuilder.js` to:
- Add preprocessing steps
- Custom file operations
- Additional build commands
- Deployment automation

## 🐛 Troubleshooting

### Common Issues

1. **CSV Parse Errors**
   - Check CSV format and encoding
   - Ensure all required fields are present
   - Validate with `npm run validate`

2. **Build Failures**
   - Check Node.js and npm versions
   - Verify template directory exists
   - Review error logs in terminal

3. **Template Processing Issues**
   - Check template syntax `{{ }}` and `[[ ]]`
   - Ensure CSV field names match template variables
   - Verify file permissions

### Debug Mode
```bash
NODE_ENV=development npm start
```
Enables detailed error logging and stack traces.

## 📈 Performance Tips

1. **Parallel Builds**: Adjust `PARALLEL_BUILDS` based on your system
2. **Dependencies**: Use `npm ci` in production for faster installs
3. **Template Size**: Keep template minimal for faster copying
4. **CSV Size**: Process large CSV files in chunks if needed

## 🚀 Deployment

### Static Hosting
Each generated website is a static React app that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting service

### Automation
Add deployment scripts to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm start && ./deploy.sh",
    "deploy:netlify": "npm start && netlify deploy --dir=build --prod"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Create an issue for bug reports
- Check existing issues for solutions
- Review the troubleshooting section

---

**Happy Website Generation! 🎉**