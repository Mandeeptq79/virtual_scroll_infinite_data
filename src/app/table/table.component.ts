import { Component, OnInit, Inject } from '@angular/core';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableVirtualScrollStrategy } from './table-vs-strategy.service';

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useClass: TableVirtualScrollStrategy,
    },
  ],
})
export class TableComponent implements OnInit {
  // Manually set the amount of buffer and the height of the table elements
  static BUFFER_SIZE = 3;
  rowHeight = 48;
  headerHeight = 56;

  rows: Observable<Array<any>> = of(
    new Array(1000).fill({
      position: 1,
      name: 'Hydrogen',
      weight: 1.0079,
      symbol: 'H',
    })
  );

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  dataSource: Observable<Array<any>>;

  gridHeight = 400;

  constructor(
    @Inject(VIRTUAL_SCROLL_STRATEGY)
    private readonly scrollStrategy: TableVirtualScrollStrategy
  ) {}

  public ngOnInit() {
    const newItems = [];
    for (let i = 1; i < 1000; i++) {
      newItems.push({
        id: i,
        name: `Element #${i}`,
      });
    }
    const range =
      Math.ceil(this.gridHeight / this.rowHeight) + TableComponent.BUFFER_SIZE;
    this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);
    this.rows = of(newItems);
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
}
