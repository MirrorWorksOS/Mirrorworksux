export type Mapper<TInput, TOutput> = (input: TInput) => TOutput;
export type ManyMapper<TInput, TOutput> = (input: TInput[]) => TOutput[];
