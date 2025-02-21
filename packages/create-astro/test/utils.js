import fs from 'node:fs';
import { setStdout } from '../dist/index.js';
import stripAnsi from 'strip-ansi';

export function setup() {
	const ctx = { messages: [] };
	before(() => {
		setStdout(
			Object.assign({}, process.stdout, {
				write(buf) {
					ctx.messages.push(stripAnsi(String(buf)).trim());
					return true;
				},
			})
		);
	});
	beforeEach(() => {
		ctx.messages = [];
	});

	return {
		messages() {
			return ctx.messages;
		},
		length() {
			return ctx.messages.length;
		},
		hasMessage(content) {
			return !!ctx.messages.find((msg) => msg.includes(content));
		},
	};
}

const resetEmptyFixture = () =>
	fs.promises.rm(new URL('./fixtures/empty/tsconfig.json', import.meta.url));
const resetNotEmptyFixture = async () => {
	const packagePath = new URL('./fixtures/not-empty/package.json', import.meta.url);
	const tsconfigPath = new URL('./fixtures/not-empty/tsconfig.json', import.meta.url);

	const overriddenPackageJson = Object.assign(
		JSON.parse(await fs.promises.readFile(packagePath, { encoding: 'utf-8' })),
		{
			scripts: {
				build: 'astro build',
			},
		}
	);

	return Promise.all([
		fs.promises.writeFile(packagePath, JSON.stringify(overriddenPackageJson, null, 2), {
			encoding: 'utf-8',
		}),
		fs.promises.writeFile(tsconfigPath, '{}', { encoding: 'utf-8' }),
	]);
};

export const resetFixtures = () =>
	Promise.allSettled([resetEmptyFixture(), resetNotEmptyFixture()]);
