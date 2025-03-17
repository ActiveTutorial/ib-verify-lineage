import express, { Request, Response } from 'express';
import axios from 'axios';
import InfiniteCraftProxy from 'ic-proxy';
import { Step, LineageResponse } from './types';

const app = express();
const port = 3000;

app.use(express.json());

// Function to validate crafting order
function validateCraftingOrder(steps: Step[]): { valid_order: boolean, invalid_element?: string, invalid_step?: number } {
    const discovered = new Set<string>(['Earth', 'Fire', 'Water', 'Wind']); // Base elements

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const a = step.a.id;
        const b = step.b.id;
        const result = step.result.id;

		if (!discovered.has(a)) {
			return { valid_order: false, invalid_element: a, invalid_step: i + 1 };
		}

		if (!discovered.has(b)) {
			return { valid_order: false, invalid_element: b, invalid_step: i + 1 };
		}

        discovered.add(result); // Mark result as available
    }

    return { valid_order: true }; // All steps follow a valid order
}

app.get('/verify', async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    // Check if id is provided
    if (!id) {
        res.status(400).json({ message: 'id is required' });
        return;
    }

    // Get lineage
    try {
        const response = await axios.get<LineageResponse>(
            `https://infinibrowser.wiki/api/recipe/custom?id=${id}`
        );

        const lineage = response.data;

		// Verify lineage
		const { valid_order, invalid_element, invalid_step } = validateCraftingOrder(lineage.steps);

		if (!valid_order) {
			res.json({ valid: false, error: `Element ${JSON.stringify(invalid_element)} was used on step ${invalid_step} before being made` });
			return;
		}

		res.json({ valid: true });
		
    } catch (e) {
        res.status(500).json({ message: (e as Error).message });
        return;
    }
});

InfiniteCraftProxy.create().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
