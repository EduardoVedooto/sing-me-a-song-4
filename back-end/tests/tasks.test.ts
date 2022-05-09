import app from '../src/app.js';
import supertest from 'supertest';
import { prisma } from '../src/database.js';
import songFactory from './factory/songFactory.js';
import dotenv from 'dotenv';

dotenv.config();

const agent = supertest(app);

describe('POST /recommendations', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 201 given a valid body', async () => {

		const recommendations = songFactory();

		const response = await agent.post('/recommendations').send(recommendations[0]);
		expect(response.status).toEqual(201);

	});

	it('should return 422 given body with no link', async () => {

		const recommendations = songFactory();

		const response = await agent.post('/recommendations').send({
			youtubeLink: recommendations[0].youtubeLink
		});
		expect(response.status).toEqual(422);

	});

	it('should return 422 given body with no name', async () => {

		const recommendations = songFactory();

		const response = await agent.post('/recommendations').send({
			name: recommendations[0].name
		});
		expect(response.status).toEqual(422);

	});

	it('should return 422 given an empty body', async () => {
		const musics = {};

		const response = await agent.post('/recommendations').send(musics);
		expect(response.status).toEqual(422);
	});
});

describe('GET /recommendations', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 200 and return the last 10 recommendations', async () => {

		const recommendations = songFactory();

		await prisma.recommendation.createMany({
			data: [
                { ...recommendations[0] },
                { ...recommendations[1] },
                { ...recommendations[2] },
                { ...recommendations[3] },
                { ...recommendations[4] },
                { ...recommendations[5] },
                { ...recommendations[6] },
                { ...recommendations[7] },
                { ...recommendations[8] },
                { ...recommendations[9] },
                { ...recommendations[10] },
                { ...recommendations[11] }
            ]
		});

		const response = await agent.get('/recommendations');
		expect(response.body.length).toBe(10);

	});

    it('should return 200 and return the last 5 recommendations', async () => {

		const recommendations = songFactory();

		await prisma.recommendation.createMany({
			data: [
                { ...recommendations[0] },
                { ...recommendations[1] },
                { ...recommendations[2] },
                { ...recommendations[3] },
                { ...recommendations[4] },
                { ...recommendations[5] },
            ]
		});

		const response = await agent.get('/recommendations');
		expect(response.body.length).toBe(5);

	});
});

describe('GET /recommendations/random', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 404 no songs created', async () => {

		const response = await agent.get('/recommendations/random');
		expect(response.status).toEqual(422);
        
	});

});

describe('GET /recommendations/top/:amount', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 200 given an amount', async () => {

		const recommendations = songFactory();
		const amount = 12;

		await prisma.recommendation.createMany({
			data: [
                { ...recommendations[0] },
                { ...recommendations[1] },
                { ...recommendations[2] },
                { ...recommendations[3] },
                { ...recommendations[4] },
                { ...recommendations[5] },
                { ...recommendations[6] },
                { ...recommendations[7] },
                { ...recommendations[8] },
                { ...recommendations[9] },
                { ...recommendations[10] },
                { ...recommendations[11] }
            ]
		});

		const response = await agent.get(`/recommendations/top/${amount}`);
		expect(response.body.length).toBe(amount);

	});

});

describe('GET /recommendations/:id', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 200 given a valid recommendation', async () => {

		const recommendations = songFactory();

		const recommendation = await prisma.recommendation.create({
			data: { ...recommendations[0] }
		});

		const response = await agent.get(`/recommendations/${recommendation.id}`);
		expect(response.body).toEqual(recommendation);

	});

});

describe('POST /recommendations/:id/upvote', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 200 given a valid recommendation', async () => {

		const recommendations = songFactory();

		const recommendation = await prisma.recommendation.create({
			data: { ...recommendations[0] }
		});

		const response = await agent.post(`/recommendations/${recommendation.id}/upvote`);
		expect(response.status).toBe(200);

	});

});

describe('POST /recommendations/:id/downvote', () => {

	beforeEach(truncateTableRecommendations);
	afterAll(disconnect);

	it('should return 200 given a valid recommendation', async () => {

		const recommendations = songFactory();

		const recommendation = await prisma.recommendation.create({
			data: { ...recommendations[0] }
		});

		const response = await agent.post(`/recommendations/${recommendation.id}/downvote`);
		expect(response.status).toBe(200);

	});

});

async function disconnect() {
	await prisma.$disconnect();
}

async function truncateTableRecommendations() {
	await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}