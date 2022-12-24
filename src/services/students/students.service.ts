import util from 'util';
import fs from 'fs';
import path from 'path';
import httpErrors from 'http-errors';
import * as child_process from 'child_process';

import IStudent from './students.interface';

class StudentsService {
    constructor(
        protected exec = util.promisify(child_process.exec),
        protected JSON_RPC_SERVER = {
            IP: process.env.JSON_RPC_SERVER_IP,
            PORT: process.env.JSON_RPC_SERVER_PORT,
        },
    ) {}

    private parseResult = (result: string): IStudent[] => {
        try {
            if (!result) {
                throw new Error();
            }

            const parsed: RegExpMatchArray | null = result.match(/(?<=Response contents:\s+).*?(?=\s+Response trailers received)/gs);

            if (!parsed || !Array.isArray(parsed) || !parsed.length) {
                throw new Error();
            }

            const { students } = JSON.parse(parsed[0]);

            return students;
        } catch (e) {
            throw httpErrors(400, 'Not correct data from server');
        }
    }

    private checkFileExists = async (url: string): Promise<boolean> => {
        if (!url) {
            return false;
        }

        return !!(await fs.promises.stat(url).catch(e => false));
    }

    public GetStudentsByEmail = async(emails: string[] = []): Promise<IStudent[]> => {
        const fileExist: boolean = await this.checkFileExists(path.join(__dirname, 'students.proto'));

        if (emails && !Array.isArray(emails)) {
            throw httpErrors(400, 'Emails must be array');
        }

        const emailString: string = JSON.stringify(emails);

        if (!fileExist) {
            throw httpErrors(400, 'Required file students.proto not found');
        }

        const { stdout } = await this.exec(`grpcurl -plaintext -import-path . -proto ${ __dirname }/students.proto -d '{"emails": ${emailString}}' -v ${this.JSON_RPC_SERVER.IP}:${this.JSON_RPC_SERVER.PORT} students.Service.GetStudentsByEmail`);

        const students: IStudent[] = this.parseResult(stdout);

        return students;
    }
}

const studentsService: StudentsService = new StudentsService();

export default studentsService;