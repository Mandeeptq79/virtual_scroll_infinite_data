import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  AfterViewInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import {
  VIRTUAL_SCROLL_STRATEGY,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { Observable, of, combineLatest } from 'rxjs';
import { map, pairwise, filter, throttleTime } from 'rxjs/operators';

import { TableVirtualScrollStrategy } from './table-vs-strategy.service';

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
  styleUrls: ['../app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useClass: TableVirtualScrollStrategy,
    },
  ],
})
export class TableComponent implements OnInit {
  listItems = [];
  // Manually set the amount of buffer and the height of the table elements
  static BUFFER_SIZE = 3;
  rowHeight = 48;
  headerHeight = 56;
  @ViewChild(CdkVirtualScrollViewport) scroller: CdkVirtualScrollViewport;
  rows: Observable<Array<any>>;

  displayedColumns: string[] = ['id', 'name'];

  dataSource: Observable<Array<any>>;

  gridHeight = 400;

  constructor(
    private ngZone: NgZone,
    @Inject(VIRTUAL_SCROLL_STRATEGY)
    private readonly scrollStrategy: TableVirtualScrollStrategy
  ) {}

  ngOnInit() {
    const range =
      Math.ceil(this.gridHeight / this.rowHeight) + TableComponent.BUFFER_SIZE;
    this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);
    this.fetchMore();
    console.log(this.listItems);
    this.rows = of(this.listItems);
    console.log(this.rows);
    this.dataSource = combineLatest([
      this.rows,
      this.scrollStrategy.scrolledIndexChange,
    ]).pipe(
      map((value: any) => {
        // Determine the start and end rendered range
        const start = Math.max(0, value[1] - TableComponent.BUFFER_SIZE);
        const end = Math.min(value[0].length, value[1] + range);

        // Update the datasource for the rendered range of data
        return value[0].slice(start, end);
      })
    );
  }

  ngAfterViewInit() {
    const range =
      Math.ceil(this.gridHeight / this.rowHeight) + TableComponent.BUFFER_SIZE;
    this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);
    this.scroller
      .elementScrolled()
      .pipe(
        map(() => this.scroller.measureScrollOffset('bottom')),
        pairwise(),
        filter(([y1, y2]) => y2 < y1 && y2 < 140),
        throttleTime(200)
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.fetchMore();
          console.log(this.listItems);
          this.rows = of(this.listItems);
          console.log(this.rows);
          this.dataSource = combineLatest([
            this.rows,
            this.scrollStrategy.scrolledIndexChange,
          ]).pipe(
            map((value: any) => {
              // Determine the start and end rendered range
              const start = Math.max(0, value[1] - TableComponent.BUFFER_SIZE);
              const end = Math.min(value[0].length, value[1] + range);

              // Update the datasource for the rendered range of data
              return value[0].slice(start, end);
            })
          );
        });
      });
  }

  fetchMore(): void {
    console.log('fetch more');
    const newItems = [];
    for (let i = 1; i < 20; i++) {
      newItems.push({
        id: i,
        name: `Element #${i}`,
      });
    }
    this.listItems = [...this.listItems, ...newItems];
    console.log(this.listItems);
  }
}
