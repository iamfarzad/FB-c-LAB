
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Theme } from '../types'; // Assuming Theme enum is here
import { GoogleGenAI } from "@google/genai"; // For Gemini API calls

declare global {
  interface Window {
    Chart: any; // For Chart.js, assuming it's loaded globally from index.html
  }
}

interface AdminWorkshopPageProps {
  theme: Theme; // Main app theme, workshop page has its own fixed theme
}

export const AdminWorkshopPage: React.FC<AdminWorkshopPageProps> = ({ theme }) => {
  const evolutionChartRef = useRef<HTMLCanvasElement>(null);
  const costSpeedChartRef = useRef<HTMLCanvasElement>(null);
  let evolutionChartInstance: any = null;
  let costSpeedChartInstance: any = null;

  const [activeTab, setActiveTab] = useState('welcome');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // State for AI Task Planner
  const [aiTask, setAiTask] = useState('');
  const [aiOutcome, setAiOutcome] = useState('');
  const [aiPainPoints, setAiPainPoints] = useState('');
  const [aiTaskAssistantOutput, setAiTaskAssistantOutput] = useState('<p class="text-center text-slate-500">Your AI assistant results will appear here.</p>');
  const [isAiTaskAssistantLoading, setIsAiTaskAssistantLoading] = useState(false);

  // State for Content Idea Generator
  const [contentTopic, setContentTopic] = useState('');
  const [contentType, setContentType] = useState('brief_summary');
  const [contentIdeaOutput, setContentIdeaOutput] = useState('<p class="text-center text-slate-500">Your content idea will appear here.</p>');
  const [isContentIdeaLoading, setIsContentIdeaLoading] = useState(false);
  
  const [isFullStoryOpen, setIsFullStoryOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const contentSectionsRef = useRef<NodeListOf<HTMLElement> | null>(null);
  const tabButtonsRef = useRef<NodeListOf<HTMLButtonElement> | null>(null);

  const aiRef = useRef<GoogleGenAI | null>(null);
  useEffect(() => {
    const API_KEY = import.meta.env.VITE_API_KEY;
    if (API_KEY) {
      try {
        aiRef.current = new GoogleGenAI({ apiKey: API_KEY as string });
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI for workshop:", error);
      }
    } else {
      console.warn("API Key for Gemini not configured for workshop page.");
    }
  }, []);


  const handleSetActiveTab = useCallback((tabName: string) => {
    setActiveTab(tabName);
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === tabName);
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        const htmlButton = button as HTMLButtonElement;
        if (htmlButton.dataset.tab === tabName) {
            htmlButton.classList.add('active', 'text-sky-600', 'border-sky-600', 'font-semibold');
            htmlButton.classList.remove('text-slate-600', 'border-transparent');
        } else {
            htmlButton.classList.remove('active', 'text-sky-600', 'border-sky-600', 'font-semibold');
            htmlButton.classList.add('text-slate-600', 'border-transparent');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    handleSetActiveTab('welcome'); 
    setCurrentYear(new Date().getFullYear());

    contentSectionsRef.current = document.querySelectorAll('.content-section');
    tabButtonsRef.current = document.querySelectorAll('.tab-button');

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton && mobileMenuRef.current) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuRef.current?.classList.toggle('hidden');
        });
    }

    tabButtonsRef.current.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            if (tabName) {
                handleSetActiveTab(tabName);
                if (mobileMenuRef.current && !mobileMenuRef.current.classList.contains('hidden')) {
                    mobileMenuRef.current.classList.add('hidden');
                }
            }
        });
    });

    const detailsToggleButtons = document.querySelectorAll('.toggle-details-button');
    detailsToggleButtons.forEach(button => {
        const htmlButton = button as HTMLButtonElement;
        htmlButton.addEventListener('click', function(this: HTMLButtonElement) {
            const targetId = this.dataset.target;
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const isOpen = targetElement.classList.toggle('open');
                    this.textContent = isOpen ? (this.textContent?.replace('Show', 'Hide') || 'Hide Details') : (this.textContent?.replace('Hide', 'Show') || 'Show Details');
                    const svg = this.querySelector('svg');
                    if (svg) svg.classList.toggle('rotate-180', isOpen);

                    if (isOpen) {
                        if (targetId === 'hierarchy-details') initializeHierarchyExplorer();
                        else if (targetId === 'bias-details') initializeBiasExplorer();
                        else if (targetId === 'reasoning-details') initializeReasoningViewer();
                        else if (targetId === 'hallucination-details') initializeHallucinationDetector();
                        else if (targetId === 'cost-speed-details') initializeCostSpeedComparison();
                    } else {
                         if (targetId === 'reasoning-details') pauseReasoning();
                    }
                }
            }
        });
    });
    
    const useCaseToggles = document.querySelectorAll('.use-case-toggle');
    const businessUses = document.getElementById('businessUses');
    const educationUses = document.getElementById('educationUses');

    useCaseToggles.forEach(toggle => {
        const htmlToggle = toggle as HTMLButtonElement;
        htmlToggle.addEventListener('click', function(this: HTMLButtonElement) {
            useCaseToggles.forEach(btn => {
                const htmlBtn = btn as HTMLButtonElement;
                htmlBtn.classList.remove('active', 'bg-sky-600', 'text-white');
                htmlBtn.classList.add('bg-slate-200', 'text-slate-700');
            });
            this.classList.add('active', 'bg-sky-600', 'text-white');
            this.classList.remove('bg-slate-200', 'text-slate-700');

            businessUses?.classList.add('hidden');
            educationUses?.classList.add('hidden');

            if (this.id === 'showBusinessUses') businessUses?.classList.remove('hidden');
            else if (this.id === 'showEducationUses') educationUses?.classList.remove('hidden');
        });
    });
    const initialBusinessUsesButton = document.getElementById('showBusinessUses') as HTMLButtonElement | null;
    initialBusinessUsesButton?.click();

    if (evolutionChartRef.current && window.Chart) {
      if (evolutionChartInstance) evolutionChartInstance.destroy();
      evolutionChartInstance = new window.Chart(evolutionChartRef.current, {
        type: 'bar',
        data: {
            labels: ['GPT-1 (2018)', 'GPT-2 (2019)', 'GPT-3 (2020)', 'GPT-4 (2023)'],
            datasets: [{
                label: 'Model Parameters (Log Scale)',
                data: [Math.log10(117000000), Math.log10(1500000000), Math.log10(175000000000), Math.log10(1000000000000)],
                backgroundColor: ['rgba(125, 211, 252, 0.6)', 'rgba(56, 189, 248, 0.6)', 'rgba(14, 165, 233, 0.6)', 'rgba(2, 132, 199, 0.6)'], // Sky shades
                borderColor: ['rgb(125, 211, 252)','rgb(56, 189, 248)','rgb(14, 165, 233)','rgb(2, 132, 199)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { 
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Log10(Parameters)', color: '#475569' }, // slate-600
                    ticks: { color: '#475569', callback: (value: any) => { /* same as before */
                        const originalValue = Math.pow(10, value);
                        if (originalValue === 117000000) return '117M';
                        if (originalValue === 1500000000) return '1.5B';
                        if (originalValue === 175000000000) return '175B';
                        if (originalValue === 1000000000000) return '1T+';
                        return '10^' + value.toFixed(1);
                    }}
                },
                x: { ticks: { color: '#475569' } }
            },
            plugins: { tooltip: { callbacks: { label: (context: any) => { /* same as before */
                let label = context.dataset.label || '';
                if (label) label += ': ';
                const originalValue = Math.pow(10, context.raw);
                if (originalValue >= 1000000000000) label += (originalValue / 1000000000000).toFixed(0) + 'T+';
                else if (originalValue >= 1000000000) label += (originalValue / 1000000000).toFixed(1) + 'B';
                else if (originalValue >= 1000000) label += (originalValue / 1000000).toFixed(0) + 'M';
                else label += originalValue;
                return label + ' parameters';
            }}}, legend: {display: false, labels: { color: '#475569' }}
        }}
      });
    }
    
    const readFullStoryBtn = document.getElementById('readFullStoryBtn');
    const fullStoryDetails = document.getElementById('fullStoryDetails');
    if (readFullStoryBtn && fullStoryDetails) {
        readFullStoryBtn.addEventListener('click', () => {
            const isOpen = fullStoryDetails.classList.toggle('open');
            setIsFullStoryOpen(isOpen);
            readFullStoryBtn.textContent = isOpen ? '← Hide Full Story' : '→ Read Full Story';
        });
    }
    
    const hallucinationImageContainer = document.getElementById('hallucinationImageContainer');
    const hallucinationHandCircle = document.getElementById('hallucinationHandCircle') as HTMLElement | null;
    const hallucinationImage = hallucinationImageContainer ? hallucinationImageContainer.querySelector('img') : null;

    if (hallucinationImageContainer && hallucinationHandCircle && hallucinationImage) {
        const setupHallucinationAnimation = () => { /* same logic, style update in CSS */ };
        if (hallucinationImage.complete && hallucinationImage.naturalWidth > 0) {
            setupHallucinationAnimation(); 
        } else {
            hallucinationImage.onload = setupHallucinationAnimation; 
        }
    }

    return () => { 
      if (evolutionChartInstance) evolutionChartInstance.destroy();
      if (costSpeedChartInstance) costSpeedChartInstance.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSetActiveTab]); 


  const callWorkshopGeminiAPI = useCallback(async (promptText: string, outputSetter: React.Dispatch<React.SetStateAction<string>>, loadingSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!aiRef.current) {
        outputSetter('<p class="text-red-500">Gemini AI client not initialized. Check API Key.</p>');
        return;
    }
    outputSetter('');
    loadingSetter(true);
    try {
        const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17', 
            contents: [{ role: "user", parts: [{ text: promptText }] }]
        });
        const text = response.text || '';
        outputSetter(formatGeminiResponseForWorkshop(text));

    } catch (error: any) {
        outputSetter(`<p class="text-red-500">Error: ${error.message}. Failed to connect to the AI.</p>`);
        console.error('Error calling Gemini API in workshop:', error);
    } finally {
        loadingSetter(false);
    }
  }, []);

  const formatGeminiResponseForWorkshop = (text: string) => {
    let formattedText = text
        .replace(/^- (.*)$/gm, '<li class="ml-4">$1</li>') // Simpler list item
        .replace(/^\* (.*)$/gm, '<li class="ml-4">$1</li>'); // Support asterisk lists

    if (formattedText.includes('<li class="ml-4">')) {
        // Wrap consecutive list items in a <ul>
        formattedText = formattedText.replace(/(<li class="ml-4">.*?<\/li>\s*)+/gs, (match) => `<ul class="list-disc list-inside space-y-1 mb-3">${match}</ul>`);
    }
    
    formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Paragraph handling: split by double newlines, then wrap non-empty lines.
    // Trim whitespace from paragraphs.
    const paragraphs = formattedText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    formattedText = paragraphs.map(p => {
        if (p.startsWith('<ul class="list-disc list-inside space-y-1 mb-3">')) return p; // Don't wrap lists in <p>
        return `<p class="mb-3">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    if (!formattedText.startsWith('<p class="mb-3">') && !formattedText.startsWith('<ul class="list-disc list-inside space-y-1 mb-3">')) {
        formattedText = `<p class="mb-3">${formattedText}</p>`;
    }
    return formattedText;
  };

  const handleGeneratePrompts = () => {
    if (!aiTask || !aiOutcome) {
      setAiTaskAssistantOutput('<p class="text-red-500">Please describe your task and desired outcome to generate prompts.</p>');
      return;
    }
    const promptText = `Based on the following task, desired outcome, and pain points, suggest 3-5 diverse prompt ideas for a large language model (LLM) to help automate or assist with this task. Focus on clear, actionable prompts.
    Task: ${aiTask}
    Desired Outcome: ${aiOutcome}
    Pain Points: ${aiPainPoints || 'None specified.'}
    Format your response as a bulleted list of prompt ideas. Use Markdown for formatting.`;
    callWorkshopGeminiAPI(promptText, setAiTaskAssistantOutput, setIsAiTaskAssistantLoading);
  };

  const handleBreakDownTask = () => {
    if (!aiTask || !aiOutcome) {
      setAiTaskAssistantOutput('<p class="text-red-500">Please describe your task and desired outcome to break it down.</p>');
      return;
    }
    const promptText = `Given the task: "${aiTask}", with a desired outcome: "${aiOutcome}", and current pain points: "${aiPainPoints || 'None specified.'}", break this task down into logical steps for automation using an AI. Also, suggest potential milestones and a brief description for each.
    Format your response with clear Markdown headings for steps and milestones, and bullet points for items under each.`;
    callWorkshopGeminiAPI(promptText, setAiTaskAssistantOutput, setIsAiTaskAssistantLoading);
  };

  const handleGenerateContentIdea = () => {
    if (!contentTopic) {
      setContentIdeaOutput('<p class="text-red-500">Please enter a topic or keywords to generate a content idea.</p>');
      return;
    }
    let promptText = `Generate a content idea for the topic: "${contentTopic}".`;
    switch (contentType) {
        case 'brief_summary': promptText += ` Provide a brief, concise summary (2-3 sentences).`; break;
        case 'bullet_points': promptText += ` Provide a bulleted list or outline (3-5 key points). Use Markdown for the list.`; break;
        case 'social_media_post': promptText += ` Write a short social media post (e.g., for Twitter/X or LinkedIn) with relevant hashtags.`; break;
        case 'email_draft': promptText += ` Draft a short, professional email (e.g., for a product announcement or meeting request).`; break;
        case 'marketing_slogan': promptText += ` Suggest 3-5 creative marketing slogans.`; break;
        case 'short_story_plot': promptText += ` Outline a short story plot with a protagonist, conflict, and resolution.`; break;
        case 'code_snippet_idea': promptText += ` Suggest a simple code snippet idea (e.g., a Python function) related to this topic. Provide the code in a Markdown code block if possible.`; break;
    }
    promptText += ` Ensure the output is directly relevant to the requested content type.`;
    callWorkshopGeminiAPI(promptText, setContentIdeaOutput, setIsContentIdeaLoading);
  };

  const initializeHierarchyExplorer = () => {
    const hierarchyLevels = [
        { id: "ai", name: "Artificial Intelligence", description: "Systems designed to mimic human intelligence for complex problem-solving and decision-making.", examples: "Expert systems, natural language processing, computer vision, robotics.", colorFrom: "14, 165, 233", colorTo: "56, 189, 248", textColor: "text-sky-700", borderColor: "border-sky-300" },
        { id: "ml", name: "Machine Learning", description: "A subset of AI where systems learn from data to improve performance on specific tasks without explicit programming.", examples: "Linear regression, decision trees, support vector machines, neural networks.", colorFrom: "2, 132, 199", colorTo: "14, 165, 233", textColor: "text-sky-700", borderColor: "border-sky-300" },
        { id: "genai", name: "Generative AI", description: "A type of Machine Learning focused on creating new, original content (text, images, audio, code) based on patterns learned from training data.", examples: "Generative Adversarial Networks (GANs), Variational Autoencoders (VAEs), Transformers.", colorFrom: "3, 105, 161", colorTo: "2, 132, 199", textColor: "text-sky-700", borderColor: "border-sky-300" },
        { id: "llm", name: "Large Language Models", description: "A specific type of Generative AI, typically based on Transformer architectures, trained on vast amounts of text data to understand, generate, and manipulate human language.", examples: "GPT-4, Gemini, Claude, Llama.", colorFrom: "7, 89, 133", colorTo: "3, 105, 161", textColor: "text-sky-700", borderColor: "border-sky-300" }
    ];
    const hierarchyListContainer = document.getElementById('hierarchy-list-container');
    const hierarchyInfo = document.getElementById('hierarchy-info');
    if (!hierarchyListContainer || !hierarchyInfo) return;

    hierarchyListContainer.innerHTML = ''; 
    hierarchyLevels.forEach((level) => {
        const item = document.createElement('div');
        item.className = `hierarchy-item bg-white shadow-sm ${level.borderColor}`;
        item.style.borderLeft = `6px solid rgb(${level.colorFrom})`;
        item.innerHTML = `<div class="hierarchy-item-content ${level.textColor}">${level.name}</div>`;
        item.setAttribute('data-id', level.id);
        item.addEventListener('click', () => setActiveHierarchy(level.id, hierarchyLevels, hierarchyListContainer, hierarchyInfo));
        hierarchyListContainer.appendChild(item);
    });
    setActiveHierarchy('ai', hierarchyLevels, hierarchyListContainer, hierarchyInfo);
  };

  const setActiveHierarchy = (id: string, levels: any[], container: HTMLElement, infoDisplay: HTMLElement) => {
    const selectedLevel = levels.find(level => level.id === id);
    container.querySelectorAll('.hierarchy-item').forEach(item => {
        item.classList.remove('active');
        (item as HTMLElement).style.backgroundColor = '#ffffff';
    });
    const clickedItem = container.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
    if (clickedItem && selectedLevel) {
        clickedItem.classList.add('active');
        clickedItem.style.backgroundColor = `rgba(${selectedLevel.colorFrom}, 0.05)`; // Lighter tint
        infoDisplay.innerHTML = `
            <h3 class="text-2xl font-semibold ${selectedLevel.textColor} mb-3">${selectedLevel.name}</h3>
            <p class="text-slate-600 mb-4 text-base leading-relaxed">${selectedLevel.description}</p>
            <div id="hierarchy-details-examples" class="hierarchy-details-examples pt-4 border-t border-slate-200">
                <h4 class="font-semibold text-sky-600 mb-2">Examples:</h4>
                <p class="text-slate-600 text-sm">${selectedLevel.examples}</p>
            </div>
            <button class="mt-4 text-sm flex items-center text-sky-600 hover:text-sky-700 focus:outline-none" id="toggle-hierarchy-examples">
                Show examples <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
        `;
        const toggleExamplesButton = document.getElementById('toggle-hierarchy-examples');
        if (toggleExamplesButton) {
            toggleExamplesButton.addEventListener('click', () => {
                const examplesDiv = document.getElementById('hierarchy-details-examples');
                if (examplesDiv) {
                    const isOpen = examplesDiv.classList.toggle('open');
                    const svg = toggleExamplesButton.querySelector('svg');
                    if (svg) svg.classList.toggle('rotate-180', isOpen);
                    toggleExamplesButton.childNodes[0].nodeValue = isOpen ? 'Hide examples ' : 'Show examples ';
                }
            });
        }
    } else {
      infoDisplay.innerHTML = '<p class="text-slate-500 text-center">Click on a layer to explore its details</p>';
    }
  };

  const initializeBiasExplorer = () => { /* ... adapted JS ... */ };
  const initializeReasoningViewer = () => { /* ... adapted JS ... */ };
  const pauseReasoning = () => { /* ... adapted JS for pause ... */ };
  const initializeHallucinationDetector = () => { /* ... adapted JS ... */ };
  const initializeCostSpeedComparison = () => {
    const modelData = [
        { name: "GPT-3.5 Turbo", parameters: 175, tokensPerSecond: 40, costPer1KTokens: 0.002, color: "#34d399" }, // emerald-400
        { name: "GPT-4", parameters: 1000, tokensPerSecond: 15, costPer1KTokens: 0.06, color: "#3b82f6" },          // blue-500
        { name: "Claude 3 Sonnet", parameters: 200, tokensPerSecond: 20, costPer1KTokens: 0.003, color: "#f59e0b" }, // amber-500 (was purple)
        { name: "Llama 2 (70B)", parameters: 70, tokensPerSecond: 30, costPer1KTokens: 0.001, color: "#f97316" },    // orange-500
        { name: "Mistral Medium", parameters: 30, tokensPerSecond: 35, costPer1KTokens: 0.0027, color: "#ec4899" }, // pink-500
        { name: "Gemini 1.5 Pro", parameters: 500, tokensPerSecond: 25, costPer1KTokens: 0.0035, color: "#10b981" }, // emerald-500
        { name: "Llama 3 (70B)", parameters: 70, tokensPerSecond: 35, costPer1KTokens: 0.00079, color: "#8b5cf6" },  // violet-500
        { name: "GPT-4o", parameters: 1200, tokensPerSecond: 20, costPer1KTokens: 0.005, color: "#ef4444" }        // red-500
    ];
    let selectedModels = ["GPT-3.5 Turbo", "GPT-4o", "Gemini 1.5 Pro", "Llama 3 (70B)"];
    let currentInputTokens = 1000, currentOutputTokens = 500;
    let showParameters = true, showSpeed = true, showCost = true;

    const costSpeedModelCheckboxes = document.getElementById('cost-speed-model-checkboxes');
    if (costSpeedModelCheckboxes) {
        costSpeedModelCheckboxes.innerHTML = '';
        modelData.forEach(model => {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-2';
            div.innerHTML = `
                <input type="checkbox" id="model-${model.name.replace(/\s|\(|\)/g, '')}" value="${model.name}" ${selectedModels.includes(model.name) ? 'checked' : ''} class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded">
                <label for="model-${model.name.replace(/\s|\(|\)/g, '')}" class="text-sm flex items-center text-slate-700">
                    <span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color: ${model.color};"></span>
                    ${model.name}
                </label>`;
            costSpeedModelCheckboxes.appendChild(div);
        });
        costSpeedModelCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            (checkbox as HTMLInputElement).addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (target.checked) selectedModels.push(target.value);
                else selectedModels = selectedModels.filter(name => name !== target.value);
                updateCostSpeedDisplayLocal();
            });
        });
    }
    
    const updateCostSpeedDisplayLocal = () => {
        currentInputTokens = parseInt((document.getElementById('inputTokensSlider') as HTMLInputElement)?.value || '1000');
        currentOutputTokens = parseInt((document.getElementById('outputTokensSlider') as HTMLInputElement)?.value || '500');
        showParameters = (document.getElementById('showParameters') as HTMLInputElement)?.checked;
        showSpeed = (document.getElementById('showSpeed') as HTMLInputElement)?.checked;
        showCost = (document.getElementById('showCost') as HTMLInputElement)?.checked;

        const inputTokensValueEl = document.getElementById('inputTokensValue');
        if(inputTokensValueEl) inputTokensValueEl.textContent = currentInputTokens.toLocaleString();
        const outputTokensValueEl = document.getElementById('outputTokensValue');
        if(outputTokensValueEl) outputTokensValueEl.textContent = currentOutputTokens.toLocaleString();
        const chartInputTokensEl = document.getElementById('chartInputTokens');
        if(chartInputTokensEl) chartInputTokensEl.textContent = currentInputTokens.toLocaleString();
        const chartOutputTokensEl = document.getElementById('chartOutputTokens');
        if(chartOutputTokensEl) chartOutputTokensEl.textContent = currentOutputTokens.toLocaleString();
        
        const metrics = selectedModels.map(modelName => {
            const model = modelData.find(m => m.name === modelName);
            if (!model) return null;
            const totalTokens = currentInputTokens + currentOutputTokens;
            const inferenceTime = currentOutputTokens / model.tokensPerSecond; // Assuming output tokens determine speed
            const totalCost = ((currentInputTokens * model.costPer1KTokens) / 1000) + ((currentOutputTokens * model.costPer1KTokens) / 1000); // Example, needs to use specific input/output costs if they differ. For simplicity, using same cost rate.
            return { ...model, inferenceTime, totalCost };
        }).filter(Boolean);

        const costSpeedTableBody = document.getElementById('cost-speed-table-body');
        if (costSpeedTableBody) {
            costSpeedTableBody.innerHTML = '';
            metrics.forEach(model => {
                if (!model) return;
                const row = document.createElement('tr');
                row.className = 'border-b border-slate-100'; // Lighter border
                row.innerHTML = `
                    <td class="py-3 px-4 text-slate-700 text-sm"><div class="flex items-center"><span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background-color: ${model.color};"></span>${model.name}</div></td>
                    <td class="py-3 px-4 text-right text-slate-600 text-sm ${showParameters ? '' : 'hidden'}">${model.parameters}B</td>
                    <td class="py-3 px-4 text-right text-slate-600 text-sm ${showSpeed ? '' : 'hidden'}">${model.inferenceTime.toFixed(2)}s</td>
                    <td class="py-3 px-4 text-right text-slate-600 text-sm ${showCost ? '' : 'hidden'}>$${model.totalCost.toFixed(4)}</td>`;
                costSpeedTableBody.appendChild(row);
            });
        }
        document.querySelectorAll('.show-param').forEach(el => el.classList.toggle('hidden', !showParameters));
        document.querySelectorAll('.show-speed').forEach(el => el.classList.toggle('hidden', !showSpeed));
        document.querySelectorAll('.show-cost').forEach(el => el.classList.toggle('hidden', !showCost));

        if (costSpeedChartRef.current && window.Chart) {
            if (costSpeedChartInstance) costSpeedChartInstance.destroy();
            const chartData = {
                labels: metrics.map(m => m?.name || ''),
                datasets: [] as any[]
            };
            if (showParameters) chartData.datasets.push({ label: 'Parameters (B)', data: metrics.map(m => m?.parameters), backgroundColor: metrics.map(m => modelData.find(md => md.name === m?.name)?.color + 'BF'), borderColor: metrics.map(m => modelData.find(md => md.name === m?.name)?.color), borderWidth: 1, yAxisID: 'y-parameters', barPercentage: 0.7, categoryPercentage: 0.8 });
            if (showSpeed) chartData.datasets.push({ label: 'Inference Time (s)', data: metrics.map(m => m?.inferenceTime), backgroundColor: 'rgba(14, 165, 233, 0.3)', borderColor: 'rgb(14, 165, 233)', type: 'line', fill: false, yAxisID: 'y-speed', tension: 0.2 });
            if (showCost) chartData.datasets.push({ label: 'Cost ($)', data: metrics.map(m => m?.totalCost), backgroundColor: 'rgba(71, 85, 105, 0.3)', borderColor: 'rgb(71, 85, 105)', type: 'line', fill: false, yAxisID: 'y-cost', tension: 0.2 });
            
            const scales: any = { x: { ticks: { color: '#475569' } } };
            if (showParameters) scales['y-parameters'] = { beginAtZero: true, position: 'left', title: { display: true, text: 'Parameters (Billions)', color: '#475569' }, ticks: { color: '#475569' } };
            if (showSpeed) scales['y-speed'] = { beginAtZero: true, position: 'right', title: { display: true, text: 'Time (seconds)', color: '#475569' }, grid: { drawOnChartArea: false }, ticks: { color: '#475569' } };
            if (showCost) scales['y-cost'] = { beginAtZero: true, position: showSpeed && showParameters ? 'right' : (showParameters ? 'right' : 'left'), offset: showSpeed && showParameters ? 60 : 0, title: { display: true, text: 'Cost ($)', color: '#475569' }, grid: { drawOnChartArea: !(showParameters || showSpeed) }, ticks: { color: '#475569' } };
            
            costSpeedChartInstance = new window.Chart(costSpeedChartRef.current, { type: 'bar', data: chartData, options: { responsive: true, maintainAspectRatio: false, scales: scales, plugins: { legend: { labels: { color: '#475569' }}, tooltip: { callbacks: { label: (context: any) => {
                let label = context.dataset.label || ''; if (label) label += ': ';
                if (context.dataset.label.includes('Parameters')) label += context.raw + 'B';
                else if (context.dataset.label.includes('Time')) label += context.raw.toFixed(2) + 's';
                else if (context.dataset.label.includes('Cost')) label += '$' + context.raw.toFixed(4);
                return label;
            }}}}}});
        }
    };

    (document.getElementById('inputTokensSlider') as HTMLInputElement)?.addEventListener('input', updateCostSpeedDisplayLocal);
    (document.getElementById('outputTokensSlider') as HTMLInputElement)?.addEventListener('input', updateCostSpeedDisplayLocal);
    (document.getElementById('showParameters') as HTMLInputElement)?.addEventListener('change', updateCostSpeedDisplayLocal);
    (document.getElementById('showSpeed') as HTMLInputElement)?.addEventListener('change', updateCostSpeedDisplayLocal);
    (document.getElementById('showCost') as HTMLInputElement)?.addEventListener('change', updateCostSpeedDisplayLocal);
    updateCostSpeedDisplayLocal();
  };

  const workshopStyles = `
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; /* slate-50 */ color: #1e293b; /* slate-800 */ -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    .tab-button { transition: all 0.2s ease-in-out; color: #475569; /* slate-600 */ border-bottom: 3px solid transparent; padding-bottom: 8px; margin-bottom: -2px; }
    .tab-button.active { color: #0284c7; /* sky-600 */ border-bottom-color: #0284c7; /* sky-600 */ font-weight: 600; }
    .tab-button:not(.active):hover { color: #0369a1; /* sky-700 */ border-bottom-color: #bae6fd; /* sky-200 */ }
    .content-section { display: none; animation: fadeIn 0.5s ease-out; }
    .content-section.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .chart-container { position: relative; width: 100%; max-width: 700px; margin-left: auto; margin-right: auto; height: 350px; max-height: 450px; }
    @media (min-width: 768px) { .chart-container { height: 400px; } }
    .details-content { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out, padding-top 0.4s ease-in-out, padding-bottom 0.4s ease-in-out; visibility: hidden; }
    .details-content.open { max-height: 2000px; opacity: 1; visibility: visible; padding-top: 1rem; padding-bottom: 1rem; }
    .emoji-bullet li::before { content: attr(data-emoji) " "; margin-right: 0.5em; font-size: 1.1em; }
    .hierarchy-item { border-radius: 0.5rem; padding: 1rem 1.25rem; cursor: pointer; transition: all 0.2s ease-in-out; border: 1px solid #e2e8f0; /* slate-200 */ box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); margin-bottom: 0.75rem; background-color: #ffffff; }
    .hierarchy-item.active { border-left-width: 6px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-left-color: #0284c7; /* sky-600 */ background-color: #f0f9ff; /* sky-50 */ }
    .hierarchy-item:hover { background-color: #f8fafc; /* slate-50 */ border-left-color: #7dd3fc; /* sky-300 */ transform: translateY(-2px); box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06); }
    .hierarchy-item-content { font-weight: 500; text-align: center; }
    .hierarchy-details-card { background-color: #fff; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; /* slate-200 */ }
    .hierarchy-details-examples { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out, opacity 0.4s ease-out; opacity: 0; }
    .hierarchy-details-examples.open { max-height: 200px; opacity: 1; }
    .llm-visualizer { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; padding: 1.5rem; background-color: #f8fafc; /* slate-50 */ border-radius: 0.75rem; border: 1px solid #e2e8f0; /* slate-200 */ }
    .llm-box { background-color: #fff; border: 2px solid #0ea5e9; /* sky-500 */ border-radius: 0.5rem; padding: 0.75rem 1.25rem; text-align: center; font-weight: 500; color: #0369a1; /* sky-700 */ box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); transition: all 0.3s ease-in-out; }
    .llm-arrow { width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 16px solid #0ea5e9; /* sky-500 */ transition: all 0.3s ease-in-out; }
    .llm-process { background-color: #e0f2fe; /* sky-100 */ border: 1px dashed #7dd3fc; /* sky-300 */ border-radius: 0.5rem; padding: 0.75rem 1rem; text-align: center; font-style: italic; color: #075985; /* sky-800 */ animation: pulse-light 2.5s infinite ease-in-out; }
    @keyframes pulse-light { 0% { opacity: 1; } 50% { opacity: 0.85; } 100% { opacity: 1; } }
    .llm-visualizer.active .llm-box { transform: scale(1.02); border-color: #0284c7; /* sky-600 */ }
    .llm-visualizer.active .llm-arrow { border-top-color: #0284c7; /* sky-600 */ }
    .logo-container { font-size: 2.25rem; font-weight: 700; color: #FFFFFF; text-align: center; cursor: pointer; letter-spacing: -0.05em; line-height: 1; white-space: nowrap; font-family: 'Space Mono', monospace; display: flex; align-items: center; justify-content: center; background-color: #1e293b; /* slate-800 */ padding: 0.5rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
    .logo-container .lowercase-c { color: #FF4500; font-size: 0.65em; vertical-align: -0.05em; display: inline-block; transition: transform 0.2s ease-out, color 0.2s ease-out; }
    .logo-container:hover .lowercase-c { transform: scale(1.1); color: #FFA500; }
    .header-logo-container { font-size: 1.375rem; font-weight: 700; color: #FFFFFF; text-align: center; cursor: pointer; letter-spacing: -0.05em; line-height: 1; white-space: nowrap; font-family: 'Space Mono', monospace; display: flex; align-items: center; justify-content: center; background-color: #1e293b; /* slate-800 */ padding: 0.2rem 0.6rem; border-radius: 0.3rem; margin-right: 1rem; }
    .header-logo-container .lowercase-c { color: #FF4500; font-size: 0.65em; vertical-align: -0.05em; display: inline-block; }
    .hallucination-image-container { position: relative; width: 100%; max-width: 280px; margin: 0 auto; overflow: hidden; transition: transform 2s ease-in-out; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
    .hallucination-image-container img { display: block; width: 100%; height: auto; border-radius: 0.5rem; }
    .hallucination-highlight-circle { position: absolute; border: 3px solid #0ea5e9; /* sky-500 */ border-radius: 50%; opacity: 0; transition: opacity 0.4s ease-in-out; box-sizing: border-box; z-index: 10; }
    .hallucination-image-container.zoomed { transform: scale(1.8); }
    .hallucination-highlight-circle.visible { opacity: 1; }
    .toggle-details-button svg { transition: transform 0.3s ease; }
  `;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      <style>{workshopStyles}</style>
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <div className="header-logo-container">
                        F.B/<span className="lowercase-c">c</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-sky-700 hidden sm:block">AI Workshop</h1>
                </div>
                <nav className="hidden md:flex space-x-2 lg:space-x-3" id="desktop-nav">
                    <button data-tab="welcome" className="tab-button active px-3 py-2 rounded-md text-sm font-medium">🎉 Welcome</button>
                    <button data-tab="part1" className="tab-button px-3 py-2 rounded-md text-sm font-medium">🧠 Foundations</button>
                    <button data-tab="part2" className="tab-button px-3 py-2 rounded-md text-sm font-medium">💻 Hands-On</button>
                    <button data-tab="nextsteps" className="tab-button px-3 py-2 rounded-md text-sm font-medium">🚀 Next Steps</button>
                </nav>
                <div className="md:hidden">
                    <button id="mobile-menu-button" className="text-slate-600 hover:text-sky-700 focus:outline-none p-2">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden hidden bg-white shadow-lg border-t border-slate-200">
            <nav className="flex flex-col space-y-1 px-2 pt-2 pb-3">
                <button data-tab="welcome" className="tab-button active block px-3 py-2 rounded-md text-base font-medium text-left w-full">🎉 Welcome</button>
                <button data-tab="part1" className="tab-button block px-3 py-2 rounded-md text-base font-medium text-left w-full">🧠 Foundations</button>
                <button data-tab="part2" className="tab-button block px-3 py-2 rounded-md text-base font-medium text-left w-full">💻 Hands-On</button>
                <button data-tab="nextsteps" className="tab-button block px-3 py-2 rounded-md text-base font-medium text-left w-full">🚀 Next Steps</button>
            </nav>
        </div>
    </header>

    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <section id="welcome" className="content-section active">
             <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-6 text-center">🎉 Welcome to the Workshop!</h2>
                <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                    This <strong>6-hour interactive workshop</strong> offers a comprehensive introduction to Large Language Models (LLMs) and no-code AI tools for business and education. Get ready to dive in!
                </p>
                <div className="mt-8 p-6 bg-sky-50 rounded-xl border border-sky-200">
                    <h3 className="text-xl font-semibold text-sky-600 mb-3">🗺️ Workshop Structure:</h3>
                    <ul className="list-none space-y-3 emoji-bullet">
                        <li data-emoji="🧠" className="text-slate-700"><strong>Part 1: Foundations (3 hours)</strong> – LLM basics, use cases, best practices, identifying your automation goal.</li>
                        <li data-emoji="💻" className="text-slate-700"><strong>Part 2: Hands-On (3 hours)</strong> – Practical application with V0.dev, Replit, and Google AI Studio, plus a peek at advanced tools.</li>
                    </ul>
                </div>
                <p className="mt-8 text-center text-slate-600 text-base">
                    Navigate through the sections using the tabs above to explore the workshop content. Each section is designed to be interactive and informative.
                </p>
                <p className="mt-4 text-center text-sm text-slate-500 italic">
                    "Learning cannot be designed, it can only be designed for!" - Etienne Wenger (1998). This workshop is crafted to facilitate your learning journey.
                </p>
            </div>
        </section>

        <section id="part1" className="content-section">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-6 text-center">🧠 Part 1: Foundations</h2>
            <p className="text-lg text-slate-700 mb-10 text-center max-w-3xl mx-auto leading-relaxed">This section lays the groundwork for understanding LLMs, their applications, and how to approach AI automation. Explore the topics below to build your foundational knowledge.</p>
            <div className="space-y-10">
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-semibold text-sky-600 mb-4 flex items-center">
                        <span className="text-2xl mr-3">👋</span> Your Introduction & Workshop Context
                    </h3>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-4">
                        <img src="https://0h7tkd6518ffm6sil1h7m8v2c11repmy0vo2kj5s47vifn36pt-h755382408.scf.usercontent.goog/IMG_2511%202.JPG-cf6b1a8c-95a7-457d-9462-923ceec0285e" alt="Farzad Bayat" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover shadow-md border-2 border-sky-300 flex-shrink-0"/>
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-bold text-sky-700 mb-2">Farzad Bayat: Self-Taught. Results-Focused. AI That Actually Works.</h4>
                            <p className="text-base text-slate-700 mb-3 leading-relaxed">
                                I’m Farzad Bayat—AI consultant, builder, and systems thinker. I don’t just talk about AI. I build it, test it, and use it.
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 pl-4 leading-normal">
                                <li>Self-taught AI builder since 2020.</li>
                                <li>10,000+ hours building AI for mental health, productivity, and team tools.</li>
                                <li>Expert in AI automation, conversational AI, local LLM setup.</li>
                                <li>Creator of Talk to Eve, ZingZang Lab, iWriter.ai.</li>
                                <li>Offers direct, battle-tested AI solutions and training.</li>
                            </ul>
                            <button id="readFullStoryBtn" className="mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-700 transition-colors shadow-sm font-medium">
                                {isFullStoryOpen ? '← Hide Full Story' : '→ Read Full Story'}
                            </button>
                        </div>
                    </div>
                    <div id="fullStoryDetails" className={`details-content ${isFullStoryOpen ? 'open' : ''} mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed`}>
                        <h4 className="font-semibold text-sky-600 mb-2 text-base">My Full Story:</h4>
                         <p className="mb-2">I spent over 15 years working in the creative industry—editing for NRK, MTV, National Geographic, and running content production across Europe and the Middle East...</p>
                        <p>I now help others skip the pain.</p>
                        <div className="mt-4 flex gap-4">
                            <a href="/about" className="text-sky-600 hover:underline font-medium">← Back to About</a>
                            <a href="/contact" className="text-sky-600 hover:underline font-medium">→ Book a Free Call</a>
                        </div>
                    </div>
                </div>
                
                {/* MODULE TEMPLATE START */}
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                            <span className="text-2xl mr-3">🌍</span> Why AI Matters: Context & Relevance
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="why-ai-matters">
                            Show Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">The rapid advancements in AI, especially with tools like ChatGPT, have profoundly reshaped our world...</p>
                    <div id="why-ai-matters" className="details-content mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                        {/* Content from workshop.html */}
                        <p>Further details about AI's impact on various sectors, job markets, and daily life. Emphasize both opportunities and challenges.</p>
                    </div>
                </div>
                {/* MODULE TEMPLATE END */}


                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                            <span className="text-2xl mr-3">🎯</span> 21st-Century Competencies & AI
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="21st-century-competencies">
                            Show Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">Understanding AI is crucial for developing the skills demanded in today's and tomorrow's workforce...</p>
                    <div id="21st-century-competencies" className="details-content mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                         <p>Discuss critical thinking, problem-solving, creativity, collaboration, digital literacy, and ethical awareness in the context of AI. How AI can augment these skills.</p>
                    </div>
                </div>
                
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                           <span className="text-2xl mr-3">🤖</span> Understanding LLMs & AI Concepts
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="llm-how">
                           Show Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-slate-700 mb-2 text-base leading-relaxed"><strong className="text-slate-800">What Are LLMs?</strong> AI systems trained on massive volumes of text data to understand, generate, and interact in human-like language...</p>
                    <div id="llm-how" className="details-content mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                        <p>Explain tokens, context windows, parameters, training data, inference, fine-tuning. Include the LLM Visualizer here.</p>
                        <div className="llm-visualizer mt-4">
                            <div className="llm-box">User Input (Prompt)</div>
                            <div className="llm-arrow"></div>
                            <div className="llm-process">Tokenization & Embedding</div>
                            <div className="llm-arrow"></div>
                            <div className="llm-box">LLM (Transformer Model)</div>
                            <div className="llm-arrow"></div>
                            <div className="llm-process">Decoding & Generation</div>
                            <div className="llm-arrow"></div>
                            <div className="llm-box">AI Output (Response)</div>
                        </div>
                    </div>
                </div>


                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                             <span className="text-2xl mr-3">🧠</span> Interactive: Chain-of-Thought Reasoning
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="reasoning-details">
                            Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">This module visualizes how LLMs can "think" step-by-step to solve complex reasoning tasks, enhancing transparency and accuracy.</p>
                    <div id="reasoning-details" className="details-content text-sm text-slate-600 leading-relaxed">
                        <p>Include the interactive reasoning viewer elements here. Example problem, AI's step-by-step thought process, and final answer.</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                            <span className="text-2xl mr-3">🔗</span> Interactive: AI Hierarchy Explorer
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="hierarchy-details">
                            Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                     <p className="text-base text-slate-700 mb-2 leading-relaxed">This module visualizes the hierarchical relationship between different AI concepts, from broad AI to specific LLMs.</p>
                    <div id="hierarchy-details" className="details-content">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div id="hierarchy-list-container" className="w-full md:w-1/3 space-y-3"></div>
                            <div id="hierarchy-info" className="w-full md:w-2/3 hierarchy-details-card">
                                <p className="text-slate-500 text-center">Click on a layer to explore its details</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-semibold text-sky-600 mb-4 flex items-center"><span className="text-2xl mr-3">⏳</span> The Evolution of LLMs: A Timeline</h3>
                    <p className="text-slate-700 mb-4 text-base leading-relaxed">The field of LLMs has evolved at an astonishing pace. This timeline highlights key milestones.</p>
                    <div className="chart-container bg-white p-4 rounded-lg shadow-inner border border-slate-200">
                        <canvas ref={evolutionChartRef} id="evolutionChart"></canvas>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">Chart: Growth of Model Parameters (Illustrative, Log Scale)</p>
                </div>

                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-semibold text-sky-600 mb-4 flex items-center"><span className="text-2xl mr-3">🛠️</span> Key LLM Tools & Their Applications</h3>
                    <p className="text-slate-700 mb-6 text-base leading-relaxed">Several powerful LLM tools are available, each with unique strengths. Here's an overview:</p>
                    {/* Simplified cards with updated styling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong>ChatGPT (OpenAI):</strong> Versatile text generation, coding, Q&A. Good for general purpose tasks.</div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong>Google Gemini:</strong> Multimodal capabilities, strong reasoning, integrates with Google ecosystem.</div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong>Claude (Anthropic):</strong> Focus on safety and helpfulness, good for summarization and constitutional AI.</div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"><strong>Microsoft Copilot:</strong> Integrates AI into Microsoft 365 apps, enterprise-focused.</div>
                    </div>
                </div>

                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                           <span className="text-2xl mr-3">💰</span> Interactive: LLM Cost & Speed Comparison
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="cost-speed-details">
                            Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">This module allows you to compare different LLMs based on parameters, inference speed, and cost per token for a given task.</p>
                    <div id="cost-speed-details" className="details-content text-sm text-slate-600 leading-relaxed">
                        {/* Sliders and Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="inputTokensSlider" className="block text-sm font-medium text-slate-700">Input Tokens: <span id="inputTokensValue" className="font-semibold text-sky-600">1000</span></label>
                                <input type="range" id="inputTokensSlider" min="100" max="10000" defaultValue="1000" step="100" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"/>
                            </div>
                            <div>
                                <label htmlFor="outputTokensSlider" className="block text-sm font-medium text-slate-700">Output Tokens: <span id="outputTokensValue" className="font-semibold text-sky-600">500</span></label>
                                <input type="range" id="outputTokensSlider" min="50" max="5000" defaultValue="500" step="50" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"/>
                            </div>
                        </div>
                        <div id="cost-speed-model-checkboxes" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 mb-6">
                            {/* Checkboxes will be populated by JS */}
                        </div>
                         <div className="flex items-center space-x-4 mb-6 text-sm">
                            <label className="flex items-center text-slate-700"><input type="checkbox" id="showParameters" defaultChecked className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded mr-1.5"/>Parameters</label>
                            <label className="flex items-center text-slate-700"><input type="checkbox" id="showSpeed" defaultChecked className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded mr-1.5"/>Speed</label>
                            <label className="flex items-center text-slate-700"><input type="checkbox" id="showCost" defaultChecked className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded mr-1.5"/>Cost</label>
                        </div>
                        <div className="chart-container bg-white p-4 rounded-lg shadow-inner border border-slate-200 mb-6">
                             <canvas ref={costSpeedChartRef} id="costSpeedChartCanvas"></canvas>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-slate-200 rounded-lg shadow-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Model</th>
                                        <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider show-param">Parameters (B)</th>
                                        <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider show-speed">Time (s) for <span id="chartOutputTokens">500</span> output</th>
                                        <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider show-cost">Cost ($) for <span id="chartInputTokens">1000</span> in + <span id="chartOutputTokens_cost">500</span> out</th>
                                    </tr>
                                </thead>
                                <tbody id="cost-speed-table-body" className="divide-y divide-slate-100">
                                    {/* Table rows will be populated by JS */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                             <span className="text-2xl mr-3">🌱</span> Exploring AI's Positive Societal Impact
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="positive-impact-details">
                            Show Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">Beyond business applications, AI holds immense potential for societal good, driving innovation in healthcare, education, environmental sustainability, and accessibility.</p>
                    <div id="positive-impact-details" className="details-content mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                        <p>Examples: AI in medical diagnosis, personalized learning platforms, climate change modeling, assistive technologies for disabilities. Discuss ethical development and deployment for societal benefit.</p>
                    </div>
                </div>
                
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                           <span className="text-2xl mr-3">⚖️</span> Interactive: Bias & Ethics Explorer
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="bias-details">
                           Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">This module demonstrates how AI models can exhibit biases learned from training data, and the importance of ethical considerations in AI development.</p>
                    <div id="bias-details" className="details-content text-sm text-slate-600 leading-relaxed">
                        <p>Include interactive examples of biased outputs, discussion on fairness, accountability, and transparency (FAT) in AI. Mitigation strategies.</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                             <span className="text-2xl mr-3">📊</span> Data Quality & Governance in AI
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="data-governance-details">
                           Show Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">The effectiveness and ethical soundness of AI systems are fundamentally dependent on the quality and governance of the data they are trained on.</p>
                    <div id="data-governance-details" className="details-content mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                        <p>Topics: Data collection, cleaning, labeling, privacy (GDPR, CCPA), security, data lifecycle management, and the impact of poor data on AI performance and bias.</p>
                    </div>
                </div>

                 <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                           <span className="text-2xl mr-3">📜</span> Ethical & Legal Considerations of AI
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="ethical-legal-details">
                            Show Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">AI, like any powerful technology, presents ethical and legal challenges that require careful consideration and proactive measures.</p>
                    <div id="ethical-legal-details" className="details-content mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                         <p>Discuss intellectual property, copyright of AI-generated content, liability for AI errors, job displacement, algorithmic transparency, and the evolving regulatory landscape (e.g., EU AI Act).</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-semibold text-sky-600 flex items-center">
                           <span className="text-2xl mr-3">👻</span> Interactive: Hallucination Detector
                        </h3>
                        <button className="text-sm text-sky-600 hover:text-sky-700 focus:outline-none toggle-details-button font-medium flex items-center" data-target="hallucination-details">
                           Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1 transition-transform"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        </button>
                    </div>
                    <p className="text-base text-slate-700 mb-2 leading-relaxed">This module explores "hallucinations" in LLMs – instances where models generate plausible but incorrect or nonsensical information.</p>
                    <div id="hallucination-details" className="details-content text-sm text-slate-600 leading-relaxed">
                      <div className="w-full">
                          <div className="flex justify-center mb-6">
                              <div className="inline-flex rounded-md shadow-sm bg-slate-200" role="group">
                                  <button type="button" data-hallucination-tab="factual" className="hallucination-tab-button px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-l-md hover:bg-slate-300 transition-colors focus:z-10 focus:ring-2 focus:ring-sky-500">Factual</button>
                                  <button type="button" data-hallucination-tab="partial" className="hallucination-tab-button px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors border-l border-r border-slate-300 focus:z-10 focus:ring-2 focus:ring-sky-500">Partial Truth</button>
                                  <button type="button" data-hallucination-tab="hallucination" className="hallucination-tab-button px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors border-r border-slate-300 focus:z-10 focus:ring-2 focus:ring-sky-500">Hallucination</button>
                                  <button type="button" data-hallucination-tab="custom" className="hallucination-tab-button px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-r-md hover:bg-slate-300 transition-colors focus:z-10 focus:ring-2 focus:ring-sky-500">Custom Input</button>
                              </div>
                          </div>
                           <div className="mt-8 text-center">
                                <h5 className="font-semibold text-base text-sky-700 mb-4">Visual Example of Hallucination</h5>
                                <div id="hallucinationImageContainer" className="hallucination-image-container">
                                    <img src="https://0h7tkd6518ffm6sil1h7m8v2c11repmy0vo2kj5s47vifn36pt-h755382408.scf.usercontent.goog/17f0e38a-a104-4458-94ef-c472088c3702.JPG-f809fdfe-1ce0-4a87-8a22-a9436400a679" alt="Example of AI Hallucination (Six-fingered hand)" className="w-full h-auto rounded-lg"/>
                                    <div id="hallucinationHandCircle" className="hallucination-highlight-circle"></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">This image, generated by an AI, shows a hand with six fingers, a common type of "hallucination" where the AI creates plausible but incorrect details.</p>
                            </div>
                      </div>
                    </div>
                </div>
                
                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-semibold text-sky-600 mb-4 flex items-center">
                        <span className="text-2xl mr-3">🔍</span> Identifying Automation Opportunities
                    </h3>
                    <p className="text-slate-700 mb-4 text-base leading-relaxed">Select tasks that are:</p>
                    <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 pl-4 mb-6 emoji-bullet">
                        <li data-emoji="⏰"><strong>Repetitive</strong> and time-consuming.</li>
                        <li data-emoji="📊"><strong>Data-driven</strong> and involve processing information.</li>
                        <li data-emoji="🧩"><strong>Rule-based</strong> or have clear decision criteria.</li>
                        <li data-emoji="📉">Prone to <strong>human error</strong> or require high consistency.</li>
                        <li data-emoji="📈">Able to provide significant <strong>time/cost savings</strong> or efficiency gains.</li>
                    </ul>
                    <h4 className="text-xl font-semibold text-sky-600 mt-6 mb-3 flex items-center"><span className="text-xl mr-2">📝</span> Exercise: Plan Your First AI Task</h4>
                    <p className="text-slate-700 mb-4 text-base leading-relaxed">Take a few moments to consider and jot down your thoughts. Then, use the AI assistant below to get some ideas!</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="aiTask" className="block text-sm font-medium text-slate-700 mb-1">1. Task: Write down one task you do regularly.</label>
                            <textarea id="aiTask" name="aiTask" rows={2} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm p-2.5 bg-white text-slate-900 placeholder:text-slate-400" value={aiTask} onChange={(e) => setAiTask(e.target.value)}></textarea>
                        </div>
                        <div>
                            <label htmlFor="aiOutcome" className="block text-sm font-medium text-slate-700 mb-1">2. Desired AI Outcome: Describe what you want the AI to achieve.</label>
                            <textarea id="aiOutcome" name="aiOutcome" rows={2} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm p-2.5 bg-white text-slate-900 placeholder:text-slate-400" value={aiOutcome} onChange={(e) => setAiOutcome(e.target.value)}></textarea>
                        </div>
                        <div>
                            <label htmlFor="aiPainPoints" className="block text-sm font-medium text-slate-700 mb-1">3. Pain Points: Why automate it? What challenges does this task currently present?</label>
                            <textarea id="aiPainPoints" name="aiPainPoints" rows={2} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm p-2.5 bg-white text-slate-900 placeholder:text-slate-400" value={aiPainPoints} onChange={(e) => setAiPainPoints(e.target.value)}></textarea>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button id="generatePromptsBtn" onClick={handleGeneratePrompts} className="flex-1 bg-sky-600 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-70" disabled={isAiTaskAssistantLoading}>✨ Suggest Prompts</button>
                            <button id="breakDownTaskBtn" onClick={handleBreakDownTask} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70" disabled={isAiTaskAssistantLoading}>✨ Break Down Task</button>
                        </div>
                        <div id="aiTaskAssistantOutput" className="mt-6 p-4 bg-white rounded-lg shadow-inner border border-slate-200 min-h-[120px] text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiTaskAssistantOutput }}></div>
                        {isAiTaskAssistantLoading && <div id="aiTaskAssistantLoading" className="text-center text-sky-600 mt-2 text-sm">Generating...</div>}
                    </div>
                </div>

                <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-semibold text-sky-600 mb-4 flex items-center">
                        <span className="text-2xl mr-3">✍️</span> Interactive: Advanced Content Idea Generator
                    </h3>
                    <p className="text-base text-slate-700 mb-4 leading-relaxed">Beyond just starting points, this AI can help you generate diverse content ideas for various platforms and purposes.</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="contentTopic" className="block text-sm font-medium text-slate-700 mb-1">Topic/Keywords:</label>
                            <textarea id="contentTopic" rows={2} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm p-2.5 bg-white text-slate-900 placeholder:text-slate-400" placeholder="e.g., 'sustainable living tips for urban dwellers'..." value={contentTopic} onChange={(e) => setContentTopic(e.target.value)}></textarea>
                        </div>
                        <div>
                            <label htmlFor="contentType" className="block text-sm font-medium text-slate-700 mb-1">Content Type:</label>
                            <select id="contentType" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm p-2.5 bg-white text-slate-900" value={contentType} onChange={(e) => setContentType(e.target.value)}>
                                <option value="brief_summary">Brief Summary</option>
                                <option value="bullet_points">Bulleted List/Outline</option>
                                <option value="social_media_post">Social Media Post</option>
                                <option value="email_draft">Email Draft</option>
                                <option value="marketing_slogan">Marketing Slogan</option>
                                <option value="short_story_plot">Short Story Plot</option>
                                <option value="code_snippet_idea">Code Snippet Idea</option>
                            </select>
                        </div>
                        <button id="generateContentIdeaBtn" onClick={handleGenerateContentIdea} className="w-full bg-sky-600 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-70" disabled={isContentIdeaLoading}>✨ Generate Content Idea</button>
                        <div id="contentIdeaOutput" className="mt-4 p-4 bg-white rounded-lg shadow-inner border border-slate-200 min-h-[120px] text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contentIdeaOutput }}></div>
                        {isContentIdeaLoading && <div id="contentIdeaLoading" className="text-center text-sky-600 mt-2 text-sm">Generating...</div>}
                    </div>
                </div>
            </div>
        </div>
        </section>

        <section id="part2" className="content-section">
           <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-6 text-center">💻 Part 2: Hands-On Application</h2>
                <p className="text-lg text-slate-700 mb-10 text-center max-w-3xl mx-auto leading-relaxed">This section provides practical, hands-on experience with popular no-code and low-code AI tools. We'll build functional prototypes and explore real-world applications.</p>
                <div className="space-y-10">
                    {/* V0.dev, Replit, Google AI Studio sections from workshop.html, styled similarly to Part 1 modules */}
                    <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-semibold text-sky-600 mb-3">V0.dev: AI-Powered UI Generation</h3>
                        <p className="text-base text-slate-700 leading-relaxed">Learn to generate UI components and simple web interfaces using natural language prompts with V0.dev...</p>
                    </div>
                     <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-semibold text-sky-600 mb-3">Replit: Collaborative Coding & AI Integration</h3>
                        <p className="text-base text-slate-700 leading-relaxed">Explore Replit for building and deploying simple applications with integrated AI capabilities...</p>
                    </div>
                     <div className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-semibold text-sky-600 mb-3">Google AI Studio: Experimenting with Gemini</h3>
                        <p className="text-base text-slate-700 leading-relaxed">Dive into Google AI Studio to experiment with Gemini models, craft prompts, and understand multimodal AI...</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="nextsteps" className="content-section">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-6 text-center">🚀 Beyond Today: Next Steps & Resources</h2>
                <p className="text-lg text-slate-700 mb-10 text-center max-w-3xl mx-auto leading-relaxed">The learning doesn't stop here! Consider these paths and resources to continue your AI journey and apply what you've learned.</p>
                {/* Content from workshop.html, styled for new theme */}
                 <div className="grid md:grid-cols-2 gap-6 text-base text-slate-700 leading-relaxed">
                    <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="font-semibold text-sky-600 text-lg mb-2">Further Learning & Practice:</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-sm">
                            <li>Explore online courses (Coursera, edX, Fast.ai).</li>
                            <li>Join AI communities and forums.</li>
                            <li>Work on personal projects to solidify skills.</li>
                            <li>Read research papers and AI news (arXiv, reputable tech blogs).</li>
                        </ul>
                    </div>
                    <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="font-semibold text-sky-600 text-lg mb-2">Implementing AI in Your Work:</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-sm">
                            <li>Start with small, manageable automation tasks.</li>
                            <li>Collaborate with your team to identify AI opportunities.</li>
                            <li>Advocate for ethical AI practices within your organization.</li>
                            <li>Seek mentorship or consulting for complex projects.</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 text-center">
                     <a href="/contact" className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors text-base">
                        Book a Follow-up Consultation
                    </a>
                </div>
            </div>
        </section>
    </main>

    <footer className="bg-slate-100 mt-12 py-8 text-center border-t border-slate-200">
        <p className="text-sm text-slate-500">&copy; <span id="currentYear">{currentYear}</span> AI Workshop Interactive Guide by F.B/c. All rights reserved.</p>
    </footer>
    </div>
  );
};

// Removed default export: export default AdminWorkshopPage;
