
import { Document, Model, Query } from "mongoose";

import { IBaseRepository } from "@/interfaces/repository/Base/IBaseRepository.js";



export class BaseRepository<T extends Document> implements IBaseRepository<T> {
	protected model: Model<T>;

	constructor(model: Model<T>) {
		this.model = model;
	}
	async create(data: Partial<T>): Promise<T> {
		return new this.model(data).save();
	}
	findById(id: string): Query<T | null, T> {
		return this.model.findById(id);
	}
	async findAll(): Promise<T[]> {
		return await this.model.find().exec();
	}
	async update(id: string, updateData: Partial<T>): Promise<T | null> {
		return await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
	}
	async delete(id: string): Promise<boolean> {
		const result = await this.model.findByIdAndDelete(id);
		return !!result;
	}
	findOne(filter: Partial<Record<keyof T, any>>): Query<T | null, T> {
		return this.model.findOne(filter);
	}

	findMany(filter: Partial<Record<keyof T, any>>): Query<T[], T> {
		return this.model.find(filter);
	}

	async findOneAndUpdate(filter: Partial<Record<keyof T, any>>, updateData: Partial<T>): Promise<T | null> {
		return await this.model.findOneAndUpdate(filter, updateData, { new: true }).exec();
	}

	async findOneAndDelete(filter: Partial<Record<keyof T, any>>): Promise<T | null> {
		return await this.model.findOneAndDelete(filter).exec();
	}

	count(filter: Partial<Record<keyof T, any>>): Promise<number> {
		return this.model.countDocuments(filter).exec();
	}
}
