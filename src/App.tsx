import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/custom/spinner';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from './components/ui/checkbox';
import { removeSpecial, removeSpecialAndLower } from './lib/textUtils';

interface IndexMapType extends Map<string, number[]> {}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State hooks
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [dataset, setDataset] = useState<string[]>([]);
  const [datasetHashTable, setDatasetHashTable] = useState<IndexMapType>(
    new Map()
  );
  const [showResultsLimit, setShowResultsLimit] = useState<number>(10);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);

  // Effect to process file content
  useEffect(() => {
    setLoading(true);
    let contentLines = fileContent.split('\n');
    setDataset(contentLines);

    const cleanContent = contentLines.map(
      caseSensitive ? removeSpecial : removeSpecialAndLower
    );

    createHashTable(cleanContent).then((hashTable) => {
      setDatasetHashTable(hashTable);
      setLoading(false);
    });
  }, [fileContent, caseSensitive]);

  // Effect to perform search
  useEffect(() => {
    setSearchResult(searchInDataset(searchQuery, datasetHashTable));
  }, [searchQuery, datasetHashTable, showResultsLimit, caseSensitive]);

  const handleFileRead = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      setFileContent(text);
    }
    setLoading(false);
  };

  function createHashTable(dataArray: string[]): Promise<IndexMapType> {
    return new Promise<IndexMapType>((resolve) => {
      const map = new Map<string, number[]>();
      const chunkSize = 500; // Adjust chunk size based on performance
      processChunk(dataArray, map, 0, chunkSize, resolve);
    });
  }

  function processChunk(
    dataArray: string[],
    map: IndexMapType,
    start: number,
    chunkSize: number,
    resolve: (map: IndexMapType) => void
  ) {
    let i = start;
    const end = Math.min(start + chunkSize, dataArray.length);

    while (i < end) {
      const word = dataArray[i].split(' ').filter((word) => word);
      word.forEach((word) => {
        const existing = map.get(word);
        map.set(word, existing ? [...existing, i] : [i]);
      });
      i++;
    }

    if (i < dataArray.length) {
      setTimeout(() => processChunk(dataArray, map, i, chunkSize, resolve), 0);
    } else {
      resolve(map);
    }
  }

  function searchInDataset(
    input: string,
    map: IndexMapType
  ): [string, number][] {
    const scores = new Map();

    input
      .split(' ')
      .map(caseSensitive ? removeSpecial : removeSpecialAndLower)
      .forEach((word) => {
        map.get(word)?.forEach((index) => {
          const sentence = dataset[index];
          scores.set(sentence, (scores.get(sentence) || 0) + 1);
        });
      });

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, showResultsLimit || 10);
  }

  return (
    <>
      <div className="h-full flex-col md:flex">
        <div className="container flex flex-col items-start gap-5 space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold">Dataset Search Playground</h2>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              className="hidden"
              accept=".txt"
              ref={fileInputRef}
              onChange={handleFileRead}
              type="file"
            />
            <Button type="submit" onClick={() => fileInputRef.current?.click()}>
              Upload a dataset{' '}
              {loading && (
                <div className="pl-2">
                  <Spinner />
                </div>
              )}
            </Button>
          </div>
        </div>
        <Separator />
        <div className="container h-full py-6">
          <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
            <div className="hidden flex-col space-y-4 sm:flex md:order-2">
              {/* <TemperatureSelector defaultValue={[0.56]} /> */}
              <div className="grid gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxlength">Case sensitive</Label>
                  <div className="px-2">
                    <Checkbox
                      id="terms"
                      checked={caseSensitive}
                      onCheckedChange={(checked) => {
                        setCaseSensitive(checked as boolean);
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxlength">Maximum results</Label>
                    <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                      {showResultsLimit}
                    </span>
                  </div>
                  <Slider
                    id="maxlength"
                    max={100}
                    min={1}
                    defaultValue={[showResultsLimit]}
                    step={1}
                    onValueChange={(e) => setShowResultsLimit(e[0])}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    aria-label="Maximum results size"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="grid h-full gap-6 lg:grid-cols-2">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="instructions">Search query:</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Type your search query here"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col space-y-2">
                    <Label htmlFor="dataset">Dataset:</Label>
                    <div
                      id="dataset"
                      className="overflow-auto whitespace-pre-line p-5 mt-[21px] h-96 rounded-md border"
                    >
                      {fileContent}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-1 flex-col space-y-2">
                    <Label htmlFor="instructions">Results:</Label>
                    <div
                      id="input"
                      className="mt-[21px] h-full rounded-md bg-muted border"
                    >
                      <ul className="p-5">
                        {searchResult.map((result, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                          >
                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {result[0]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </ul>{' '}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
