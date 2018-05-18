import {HttpClient} from "@angular/common/http";
import {Component, Input, OnInit} from "@angular/core";
import {ITdDataTableColumn, TdDataTableService} from "@covalent/core/data-table";
import {DataSource} from '../../api/models/datasource';
import {DatePipe} from '@angular/common';
import {StateService} from "@uirouter/angular";
import {TdBytesPipe} from '@covalent/core/common';

interface RemoteFile {
    name: string;
    directory: boolean;
    length: number;
    modificationTime: Date;
    path: string;
}

@Component({
    selector: "remote-files",
    styleUrls: ["js/feed-mgr/catalog/datasource/files/remote-files.component.css"],
    templateUrl: "js/feed-mgr/catalog/datasource/files/remote-files.component.html"
})
export class RemoteFilesComponent implements OnInit {

    @Input()
    public datasource: DataSource;

    @Input()
    path: string;

    FILE_SIZE_FORMAT: (v: any) => any = (v: number) => new TdBytesPipe().transform(v, 2);
    DATE_FORMAT: (v: any) => any = (v: number) => new DatePipe('en-US').transform(v, 'dd/MM/yyyy hh:mm:ss');

    columns: ITdDataTableColumn[] = [
        {name: "directory", label: "", width: 48},
        {name: "name", label: "Name", sortable: true},
        {name: "length", label: "Size", numeric: true, sortable: true, width: 200, format: this.FILE_SIZE_FORMAT},
        {name: "modificationTime", label: "Last modified", sortable: true, width: 210, format: this.DATE_FORMAT}
    ];

    paths: string[];

    files: RemoteFile[] = [];

    filteredFiles: RemoteFile[] = [];

    filteredTotal = 0;

    pageSize = 50;

    selectedRows: any[] = [];

    constructor(private dataTableService: TdDataTableService, private http: HttpClient, private state: StateService) {
    }

    public ngOnInit(): void {
        this.paths = this.path.split("/");
        this.http.get("/proxy/v1/catalog/dataset/" + this.datasource.id + "/browse?path=" + encodeURIComponent(this.path))
            .subscribe((data: RemoteFile[]) => {
                this.files = data;
                this.filter();
            });
    }

    browseTo(pathIndex: number) {
        const location = this.paths.slice(0, pathIndex + 1).join("/");
        this.state.go("catalog.datasource.browse", {path: encodeURIComponent(location)}, {notify:false, reload:false});
    }

    rowClick(file: RemoteFile): void {
        if (file.directory) {
            this.state.go("catalog.datasource.browse", {path: encodeURIComponent(this.path + "/" + file.name)}, {notify:false, reload:false});
        }
    }

    search(event: any): void {

    }

    private filter(): void {
        this.filteredFiles = this.files;
    }
}
