import { Column, Model, Table } from "sequelize-typescript";

@Table
export class SymbolStatus extends Model {
  @Column
  userId!: number;

  @Column
  symbol!: string;

  @Column
  mode!: string;

  @Column
  status!: string;
}
