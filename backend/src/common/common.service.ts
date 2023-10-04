import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CommonService {
    async getRandomJoke() {
        try {
            const response = await axios.get('https://api.chucknorris.io/jokes/random');
            return {
                status: 200,
                message: 'success',
                data: response?.data?.value
            };
        } catch (error) {
            console.error('An error occurred while fetching a random joke:', error);
            throw error;
        }
    }

}
