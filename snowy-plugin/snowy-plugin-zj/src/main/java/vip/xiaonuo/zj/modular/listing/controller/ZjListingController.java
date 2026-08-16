package vip.xiaonuo.zj.modular.listing.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vip.xiaonuo.auth.core.annotation.SaClientCheckLogin;
import vip.xiaonuo.common.pojo.CommonResult;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;
import vip.xiaonuo.zj.modular.listing.param.ZjListingCreateParam;
import vip.xiaonuo.zj.modular.listing.param.ZjListingQueryParam;
import vip.xiaonuo.zj.modular.listing.param.ZjListingReviewParam;
import vip.xiaonuo.zj.modular.listing.service.ZjListingService;

import java.util.List;

@Tag(name = "租迹房源")
@RestController
@Validated
@RequestMapping("/api/zj/listings")
public class ZjListingController {

    @Resource
    private ZjListingService listingService;

    @Operation(summary = "公开房源列表")
    @GetMapping
    public CommonResult<Page<ZjListing>> page(ZjListingQueryParam param) {
        return CommonResult.data(listingService.publicPage(param));
    }

    @Operation(summary = "公开房源详情")
    @GetMapping("/detail")
    public CommonResult<ZjListing> detail(@RequestParam @NotBlank String id) {
        return CommonResult.data(listingService.publicDetail(id));
    }

    @Operation(summary = "发布房源")
    @SaClientCheckLogin
    @PostMapping
    public CommonResult<String> create(@RequestBody @Valid ZjListingCreateParam param) {
        return CommonResult.data(listingService.create(param));
    }

    @Operation(summary = "我的发布")
    @SaClientCheckLogin
    @GetMapping("/mine")
    public CommonResult<List<ZjListing>> mine() {
        return CommonResult.data(listingService.myListings());
    }

    @Operation(summary = "后台审核房源")
    @SaCheckPermission("/zj/listing/review")
    @PostMapping("/review")
    public CommonResult<String> review(@RequestBody @Valid ZjListingReviewParam param) {
        listingService.review(param);
        return CommonResult.ok();
    }
}
