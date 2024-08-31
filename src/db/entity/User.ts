import { Column, Model, Table } from "sequelize-typescript";

@Table
export class User extends Model {
  @Column
  userId!: string;

  @Column
  email!: string;

  @Column
  password!: string;

  @Column
  key!: string;

  @Column
  enabled!: boolean;
}
