import { useState, FormEvent } from 'react';
import OpenAI from 'openai';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { dates } from '../../utils/dates';

interface StockDataResult {
  v: number;    // volume
  vw: number;   // volume weighted average price
  o: number;    // open price
  c: number;    // close price
  h: number;    // high price
  l: number;    // low price
  t: number;    // timestamp
  n: number;    // number of transactions
}

interface StockDataResponse {
  ticker: string;
  results: StockDataResult[];
  status: string;
  request_id: string;
  count: number;
}

const parseStockData = (stockDataArray: string[]): StockDataResponse[] => {
  return stockDataArray.map(dataString => {
    const data = JSON.parse(dataString)
    delete data.request_id
    return data
  });
};

export const HomePage = () => {
  
  const [tickers, setTickers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const systemMessage = {
    role: "system" as const,
    content: "You are a knowledgeable stock market expert who provides actionable insights on stock trends and market data Consider text between ### as an example of the output you will provide."
  };
  const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessageParam[]>([
    { role: "system" as const, content: "You are a knowledgeable stock market expert who provides actionable insights on stock trends and market data." }
  ]);


  const newFetchCompletion = async (msgs: OpenAI.Chat.ChatCompletionMessageParam[]) => {
    const url = '/api/';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(msgs)
    });


    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Worker error: ${data.error}`);
    }

    return data;
  }


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.length < 3) {
      setError('You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.');
      return;
    }
    if (tickers.length >= 3) {
      setError('Maximum 3 tickers allowed');
      return;
    }
    setTickers([...tickers, inputValue.toUpperCase()]);
    setInputValue('');
    setError('');
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const stockData = await Promise.all(
        tickers.map(async (ticker) => {
          const url = `https://polygon-api-worker.my-ai-cloudflare-app.workers.dev?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch');
          return response.text();
        })
      );
      const parsedData = parseStockData(stockData);

      console.log('parsedData', parsedData);
      
      const formattedData = parsedData
        .map(stock => {
          const latestResult = stock.results[stock.results.length - 1];
          return `
Stock: ${stock.ticker}
Latest Trading Data:
- Opening Price: $${latestResult.o}
- Closing Price: $${latestResult.c}
- Highest Price: $${latestResult.h}
- Lowest Price: $${latestResult.l}
- Volume: ${latestResult.v}
- Volume Weighted Average Price: $${latestResult.vw}
- Number of Transactions: ${latestResult.n}
- Timestamp: ${new Date(latestResult.t).toLocaleDateString()}`;
        })
        .join('\n\n');

      const newMessages = [...messages, {
        role: "user" as const, 
        content: formattedData
      }]

      setMessages(newMessages);
      const lastMessage = newMessages[newMessages.length - 1];
      const completion = await newFetchCompletion([systemMessage, lastMessage]);
      console.log('completion', completion);
      setReport(completion);
    } catch (err) {
      setError('There was an error fetching stock data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4">
        <header className="bg-black p-4 flex justify-center mb-6">
          <div className="text-white text-2xl font-bold">Dodgy Dave's Stock Predictions</div>
        </header>

        <main className="flex flex-col items-center">
          {!isLoading && !report && (
            <section className="action-panel w-full max-w-md">
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
                <label className={`text-center ${error ? 'text-red-500' : ''}`}>
                  Add up to 3 stock tickers below to get a super accurate stock predictions report👇
                </label>
                <div className="flex w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="MSFT"
                    className="flex-1 p-4 border-2 border-black border-r-0"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-white border-2 border-black"
                  >
                    +
                  </button>
                </div>
              </form>

              <div className="my-4">
                {tickers.map((ticker, index) => (
                  <span key={ticker} className="mr-2">
                    {ticker}{index < tickers.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={tickers.length === 0}
                className="w-full bg-[#46ff90] p-4 border-2 border-black uppercase font-medium disabled:opacity-50"
              >
                Generate Report
              </button>

              <p className="font-comic text-sm font-bold mt-4">
                Always correct 15% of the time!
              </p>
            </section>
          )}

          {isLoading && (
            <section className="loading-panel flex flex-col items-center gap-4">
              <div className="animate-spin">⌛</div>
              <div>Querying Stocks API...</div>
            </section>
          )}

          {report && (
            <section className="output-panel border-2 border-black p-4 w-full max-w-md">
              <h2 className="text-center">Your Report 😜</h2>
              <p className="mt-4">{report}</p>
            </section>
          )}
        </main>

        <footer className="text-center text-sm mt-8">
          &copy; This is not real financial advice!
        </footer>
      </div>
    </MainLayout>
  );
}; 