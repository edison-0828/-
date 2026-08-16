package vip.xiaonuo.zj.modular.listing.param;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZjListingQueryParam {
    @Schema(description = "页码")
    private Integer current = 1;
    @Schema(description = "每页条数，最大50")
    private Integer size = 20;
    private String city;
    private String district;
    private String keyword;
    private Long minRentCents;
    private Long maxRentCents;
    @Schema(description = "RECOMMENDED、RENT_ASC、RENT_DESC、AVAILABLE_ASC")
    private String sort = "RECOMMENDED";
}
