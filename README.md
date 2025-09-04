# AI Cover Letter Generator

A modern, beautiful web application that generates tailored cover letters using AI. Built with Next.js, TypeScript, and OpenAI's GPT-3.5.

![Cover Letter Generator](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

- **AI-Powered Generation**: Uses OpenAI GPT-3.5 to create professional, tailored cover letters
- **Beautiful UI/UX**: Modern glassmorphism design with smooth animations
- **Smart Text Compression**: Efficiently handles large resumes and job descriptions
- **Auto-Save**: Automatically saves your progress to browser storage
- **Edit & Customize**: Edit generated cover letters directly in the app
- **Export Options**: Export to PDF or Word format (coming soon)
- **Mobile Responsive**: Works perfectly on all devices
- **Real-time Progress**: Visual progress indicator and loading states

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/BrandonChurch93/AICoverLetterGenerator.git
cd AICoverLetterGenerator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design Features

- **Glassmorphism Effects**: Semi-transparent elements with backdrop blur
- **Gradient Animations**: Floating orbs and gradient borders
- **Micro-interactions**: Magnetic buttons, smooth transitions
- **Light Theme**: Clean, professional appearance
- **Futuristic Aesthetic**: Modern 2030-inspired design

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Icons**: Lucide React
- **Compression**: LZ-String
- **Export**: jsPDF, docx

## 📁 Project Structure

```
ai-cover-letter-generator/
├── app/
│   ├── api/
│   │   └── generate/     # OpenAI API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/
│   └── ui.tsx             # Reusable UI components
├── lib/
│   ├── compression.ts     # Text compression utilities
│   ├── export.ts          # PDF/Word export functions
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## 🔧 Configuration

### OpenAI API

The app uses GPT-3.5-turbo by default. To change the model, edit `app/api/generate/route.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", // Change model here
  // ... other options
});
```

### Styling

Customize colors and theme in `app/globals.css`:

```css
:root {
  --color-primary: 14 165 233; /* Sky blue */
  --color-accent: 132 204 22; /* Lime green */
  /* ... other variables */
}
```

## 📝 Usage

1. **Enter Your Resume**: Paste or type your resume in the first text area
2. **Add Job Description**: Paste the job posting you're applying for
3. **Optional Details**: Add key skills, achievements, and preferences
4. **Generate**: Click "Generate Cover Letter" to create your letter
5. **Edit**: Make any adjustments directly in the preview
6. **Export**: Download as PDF or Word document

## 🚧 Roadmap

- [x] Core generation functionality
- [x] Edit generated letters
- [x] Copy to clipboard
- [ ] PDF export implementation
- [ ] Word document export
- [ ] File upload for resumes
- [ ] Multiple cover letter templates
- [ ] Save cover letter history
- [ ] User accounts & cloud storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Brandon Church**

- GitHub: [@BrandonChurch93](https://github.com/BrandonChurch93)
- Director of UI/UX

## 🙏 Acknowledgments

- OpenAI for the GPT API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The open-source community

---

Built with ❤️ for job seekers everywhere
